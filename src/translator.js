import * as cheerio from 'cheerio';

/**
 * Translates a single text string using Google Translate GTX API
 * @param {string} text - The input text to translate
 * @param {string} targetLang - Target language code (e.g. 'es', 'fr', 'hi')
 * @returns {Promise<string>} - The translated text
 */
export async function translateText(text, targetLang) {
  if (!text || !text.trim()) return text;

  // Google Translate GTX Single API URL
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Google Translate API returned status ${res.status}`);
    }
    const json = await res.json();
    if (json && json[0]) {
      let translated = '';
      for (const sentence of json[0]) {
        if (sentence && sentence[0]) {
          translated += sentence[0];
        }
      }
      return translated;
    }
    return text;
  } catch (err) {
    console.error(`[Translator] Error translating to ${targetLang}:`, err);
    return text; // Fallback to original text on failure
  }
}

/**
 * Detects the source language of a string of text
 * @param {string} text 
 * @returns {Promise<string>} - Detected language code (default 'en')
 */
export async function detectLanguage(text) {
  if (!text || !text.trim()) return 'en';
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=en&dt=t&q=${encodeURIComponent(text.slice(0, 1000))}`;
  try {
    const res = await fetch(url);
    if (res.ok) {
      const json = await res.json();
      if (json && json[2]) {
        return json[2];
      }
    }
  } catch (err) {
    console.error('[Translator] Language detection error:', err);
  }
  return 'en';
}

/**
 * Translates HTML content while preserving tags and attributes
 * @param {string} html 
 * @param {string} targetLang 
 * @returns {Promise<string>}
 */
export async function translateHtml(html, targetLang) {
  if (!html || !html.trim()) return html;
  
  try {
    const $ = cheerio.load(html, { xmlMode: false }, false);
    
    // Recursive function to walk the DOM tree and translate text nodes
    async function walk(node) {
      if (node.type === 'text') {
        const originalText = node.data;
        const trimmed = originalText.trim();
        if (trimmed && !/^\d+$/.test(trimmed) && !trimmed.startsWith('__')) {
          const translated = await translateText(trimmed, targetLang);
          // Preserve leading/trailing whitespace of the original text node
          const leadingWhitespace = originalText.match(/^\s*/)[0];
          const trailingWhitespace = originalText.match(/\s*$/)[0];
          node.data = leadingWhitespace + translated + trailingWhitespace;
        }
      } else if (node.children) {
        for (const child of node.children) {
          // Skip script and style tags
          if (child.name === 'script' || child.name === 'style') {
            continue;
          }
          await walk(child);
        }
      }
    }

    await walk($.root()[0]);
    return $.html();
  } catch (err) {
    console.error('[Translator] HTML translation failed:', err);
    return html;
  }
}

/**
 * Translates JSON content while preserving keys and structure
 * @param {string} jsonString 
 * @param {string} targetLang 
 * @returns {Promise<string>}
 */
export async function translateJson(jsonString, targetLang) {
  if (!jsonString || !jsonString.trim()) return jsonString;

  try {
    const data = JSON.parse(jsonString);

    async function walk(obj) {
      if (typeof obj === 'string') {
        return await translateText(obj, targetLang);
      } else if (Array.isArray(obj)) {
        const translatedArray = [];
        for (const element of obj) {
          translatedArray.push(await walk(element));
        }
        return translatedArray;
      } else if (obj !== null && typeof obj === 'object') {
        const translatedObj = {};
        for (const key in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, key)) {
            translatedObj[key] = await walk(obj[key]);
          }
        }
        return translatedObj;
      }
      return obj; // Return numbers, booleans, null as-is
    }

    const translatedData = await walk(data);
    return JSON.stringify(translatedData, null, 2);
  } catch (err) {
    console.error('[Translator] JSON translation failed:', err);
    return jsonString;
  }
}

/**
 * Translates Markdown while preserving code blocks, inline code, and link URLs
 * @param {string} markdown 
 * @param {string} targetLang 
 * @returns {Promise<string>}
 */
export async function translateMarkdown(markdown, targetLang) {
  if (!markdown || !markdown.trim()) return markdown;

  try {
    const placeholders = [];
    let counter = 0;

    // 1. Extract and protect code blocks
    let processed = markdown.replace(/```[\s\S]+?```/g, (match) => {
      const id = `__MDCODEBLOCK_${counter++}__`;
      placeholders.push({ id, original: match });
      return id;
    });

    // 2. Extract and protect inline code
    processed = processed.replace(/`[^`\n]+`/g, (match) => {
      const id = `__MDINLINE_${counter++}__`;
      placeholders.push({ id, original: match });
      return id;
    });

    // 3. Extract and protect link URLs
    // Protect only the URL part, e.g. [text](url) -> [text](__URL_0__)
    processed = processed.replace(/\]\(([^)]+)\)/g, (match, url) => {
      const id = `__MDURL_${counter++}__`;
      placeholders.push({ id, original: url });
      return `](${id})`;
    });

    // Translate the processed markdown text
    // Splitting by lines to maintain structure of headers, lists, blockquotes, etc.
    const lines = processed.split('\n');
    const translatedLines = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) {
        translatedLines.push(line);
        continue;
      }

      // Check if line is a structural markdown element
      // We want to preserve lists (- or * or 1.), headers (#), blockquotes (>), tables (|)
      const headerMatch = line.match(/^(#{1,6}\s+)(.*)$/);
      const listMatch = line.match(/^(\s*[-*+]\s+)(.*)$/);
      const numListMatch = line.match(/^(\s*\d+\.\s+)(.*)$/);
      const quoteMatch = line.match(/^(\s*>\s*)(.*)$/);

      if (headerMatch) {
        const content = await translateText(headerMatch[2], targetLang);
        translatedLines.push(headerMatch[1] + content);
      } else if (listMatch) {
        const content = await translateText(listMatch[2], targetLang);
        translatedLines.push(listMatch[1] + content);
      } else if (numListMatch) {
        const content = await translateText(numListMatch[2], targetLang);
        translatedLines.push(numListMatch[1] + content);
      } else if (quoteMatch) {
        const content = await translateText(quoteMatch[2], targetLang);
        translatedLines.push(quoteMatch[1] + content);
      } else if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
        // Table row. Split cell contents, translate them individually, and join back.
        const cells = line.split('|');
        const translatedCells = [];
        for (let i = 0; i < cells.length; i++) {
          const cell = cells[i];
          const trimmedCell = cell.trim();
          // Skip empty cells or header separators (---)
          if (!trimmedCell || /^:?-+:?$/.test(trimmedCell)) {
            translatedCells.push(cell);
          } else {
            const leading = cell.match(/^\s*/)[0];
            const trailing = cell.match(/\s*$/)[0];
            const trans = await translateText(trimmedCell, targetLang);
            translatedCells.push(leading + trans + trailing);
          }
        }
        translatedLines.push(translatedCells.join('|'));
      } else {
        // Normal paragraph text
        const translated = await translateText(line, targetLang);
        translatedLines.push(translated);
      }
    }

    let result = translatedLines.join('\n');

    // Restore placeholders in reverse order
    for (let i = placeholders.length - 1; i >= 0; i--) {
      const p = placeholders[i];
      result = result.replace(p.id, p.original);
    }

    return result;
  } catch (err) {
    console.error('[Translator] Markdown translation failed:', err);
    return markdown;
  }
}

/**
 * Translates comments and string literals in code snippets while preserving code syntax
 * @param {string} code 
 * @param {string} targetLang 
 * @param {string} ext - File extension (e.g. 'js', 'py')
 * @returns {Promise<string>}
 */
export async function translateCode(code, targetLang, ext) {
  if (!code || !code.trim()) return code;

  try {
    let regex;
    if (ext === 'py') {
      // Python: # comments, """ docs """, ''' docs ''', "strings", 'strings'
      regex = /(#.*)|("""[\s\S]*?""")|(三'[\s\S]*?'"")|(".*?")|('.*?')/g;
    } else {
      // JS, TS, Java, C++, C#, etc: // comments, /* comments */, `strings`, "strings", 'strings'
      regex = /(\/\/.*)|(\/\*[\s\S]*?\*\/)|(`[\s\S]*?`)|(".*?")|('.*?')/g;
    }

    let offset = 0;
    let result = '';
    regex.lastIndex = 0;
    let match;

    while ((match = regex.exec(code)) !== null) {
      const matchedText = match[0];
      const matchIndex = match.index;

      // Add non-matching code content before match
      result += code.slice(offset, matchIndex);

      let translatedMatch = matchedText;

      if (matchedText.startsWith('//')) {
        const commentText = matchedText.slice(2);
        const translated = await translateText(commentText, targetLang);
        translatedMatch = '//' + translated;
      } else if (matchedText.startsWith('/*')) {
        const commentText = matchedText.slice(2, -2);
        const translated = await translateText(commentText, targetLang);
        translatedMatch = '/*' + translated + '*/';
      } else if (matchedText.startsWith('#')) {
        const commentText = matchedText.slice(1);
        const translated = await translateText(commentText, targetLang);
        translatedMatch = '#' + translated;
      } else if (matchedText.startsWith('"""') && matchedText.endsWith('"""')) {
        const stringText = matchedText.slice(3, -3);
        const translated = await translateText(stringText, targetLang);
        translatedMatch = '"""' + translated + '"""';
      } else if (matchedText.startsWith("'''") && matchedText.endsWith("'''")) {
        const stringText = matchedText.slice(3, -3);
        const translated = await translateText(stringText, targetLang);
        translatedMatch = "'''" + translated + "'''";
      } else if (matchedText.startsWith('`') && matchedText.endsWith('`')) {
        const stringText = matchedText.slice(1, -1);
        // Template literal: protect template expressions like ${expression}
        const parts = stringText.split(/\$\{[^}]+\}/);
        const expressions = stringText.match(/\$\{[^}]+\}/g) || [];
        const translatedParts = [];

        for (const part of parts) {
          if (part.trim()) {
            translatedParts.push(await translateText(part, targetLang));
          } else {
            translatedParts.push(part);
          }
        }

        let reconstructed = '';
        for (let i = 0; i < translatedParts.length; i++) {
          reconstructed += translatedParts[i];
          if (i < expressions.length) {
            reconstructed += expressions[i];
          }
        }
        translatedMatch = '`' + reconstructed + '`';
      } else if (matchedText.startsWith('"') && matchedText.endsWith('"')) {
        const stringText = matchedText.slice(1, -1);
        // Only translate if it contains letters (avoid pure symbols/numbers)
        if (stringText.trim() && /[a-zA-Z]/.test(stringText)) {
          const translated = await translateText(stringText, targetLang);
          translatedMatch = '"' + translated + '"';
        }
      } else if (matchedText.startsWith("'") && matchedText.endsWith("'")) {
        const stringText = matchedText.slice(1, -1);
        if (stringText.trim() && /[a-zA-Z]/.test(stringText)) {
          const translated = await translateText(stringText, targetLang);
          translatedMatch = "'" + translated + "'";
        }
      }

      result += translatedMatch;
      offset = regex.lastIndex;
    }

    result += code.slice(offset);
    return result;
  } catch (err) {
    console.error('[Translator] Code translation failed:', err);
    return code;
  }
}

/**
 * Universal content translator dispatcher
 * @param {string} content 
 * @param {string} format - 'text' | 'html' | 'json' | 'markdown' | 'code'
 * @param {string} targetLang 
 * @param {string} [ext] - File extension (needed for code translation)
 * @returns {Promise<string>}
 */
export async function translateContent(content, format, targetLang, ext = 'js') {
  if (!content) return '';
  switch (format) {
    case 'html':
      return await translateHtml(content, targetLang);
    case 'json':
      return await translateJson(content, targetLang);
    case 'markdown':
      return await translateMarkdown(content, targetLang);
    case 'code':
      return await translateCode(content, targetLang, ext);
    case 'text':
    default:
      return await translateText(content, targetLang);
  }
}
