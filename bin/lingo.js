#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { translateContent, detectLanguage } from '../src/translator.js';

const args = process.argv.slice(2);

async function main() {
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    printHelp();
    process.exit(0);
  }

  const command = args[0];

  if (command === 'translate') {
    // Usage: lingo translate --to <lang> [--format <format>] [file]
    const toIndex = args.indexOf('--to');
    if (toIndex === -1 || toIndex + 1 >= args.length) {
      console.error('Error: --to <lang> is required.');
      process.exit(1);
    }
    const toLang = args[toIndex + 1];

    const formatIndex = args.indexOf('--format');
    const format = formatIndex !== -1 ? args[formatIndex + 1] : null;

    // Determine if file path is provided (last argument if not flag/value)
    let filePath = null;
    const lastArg = args[args.length - 1];
    if (
      lastArg && 
      !lastArg.startsWith('-') && 
      args[args.length - 2] !== '--to' && 
      args[args.length - 2] !== '--format' &&
      lastArg !== 'translate'
    ) {
      filePath = lastArg;
    }

    let content = '';
    let detectedFormat = format;

    if (filePath) {
      const resolvedPath = path.resolve(filePath);
      if (!fs.existsSync(resolvedPath)) {
        console.error(`Error: File not found: ${filePath}`);
        process.exit(1);
      }
      content = fs.readFileSync(resolvedPath, 'utf-8');
      
      if (!detectedFormat) {
        const ext = path.extname(resolvedPath).toLowerCase();
        if (ext === '.html' || ext === '.htm') detectedFormat = 'html';
        else if (ext === '.json') detectedFormat = 'json';
        else if (ext === '.md') detectedFormat = 'markdown';
        else if (['.js', '.ts', '.py', '.cpp', '.h', '.cs', '.go', '.java'].includes(ext)) {
          detectedFormat = 'code';
        } else {
          detectedFormat = 'text';
        }
      }
    } else {
      // Read from stdin
      content = await readStdin();
      if (!detectedFormat) {
        detectedFormat = 'text';
      }
    }

    try {
      const ext = filePath ? path.extname(filePath).slice(1) : 'js';
      const translated = await translateContent(content, detectedFormat, toLang, ext);
      process.stdout.write(translated);
    } catch (err) {
      console.error('Translation error:', err);
      process.exit(1);
    }
  } else if (command === 'detect') {
    // Usage: lingo detect [file]
    let filePath = null;
    if (args[1] && !args[1].startsWith('-')) {
      filePath = args[1];
    }

    let content = '';
    if (filePath) {
      const resolvedPath = path.resolve(filePath);
      if (!fs.existsSync(resolvedPath)) {
        console.error(`Error: File not found: ${filePath}`);
        process.exit(1);
      }
      content = fs.readFileSync(resolvedPath, 'utf-8');
    } else {
      content = await readStdin();
    }

    try {
      const lang = await detectLanguage(content);
      console.log(lang);
    } catch (err) {
      console.error('Detection error:', err);
      process.exit(1);
    }
  } else if (command === 'init') {
    const configPath = path.resolve('i18n.json');
    const defaultConfig = {
      sourceLanguage: 'en',
      targetLanguages: ['hi', 'ta', 'te', 'fr', 'es', 'de'],
      files: ['./input/**/*.txt']
    };
    fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2));
    console.log(`Lingo project initialized. Configuration written to: ${configPath}`);
  } else {
    console.error(`Unknown command: ${command}`);
    printHelp();
    process.exit(1);
  }
}

function readStdin() {
  return new Promise((resolve) => {
    if (process.stdin.isTTY) {
      resolve('');
      return;
    }
    let data = '';
    process.stdin.setEncoding('utf-8');
    process.stdin.on('data', (chunk) => {
      data += chunk;
    });
    process.stdin.on('end', () => {
      resolve(data);
    });
  });
}

function printHelp() {
  console.log(`
Lingo CLI - Multilingual translation & localization pipeline engine

Usage:
  lingo translate --to <lang> [--format <format>] [file]   Translate content from file or stdin
  lingo detect [file]                                      Detect language of content
  lingo init                                               Initialize configuration file (i18n.json)
  lingo --help, -h                                         Show this help menu

Formats supported:
  text, html, json, markdown, code
`);
}

main();
