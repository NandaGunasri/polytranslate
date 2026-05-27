// PolyTranslate X Client Application State
const state = {
  activeFile: null,      // Meta of uploaded file
  inputText: '',         // Typed input text if no file
  selectedTargetLangs: [], // Checked target languages
  translations: null,    // Translated results
  downloadUrls: null,    // Download file URLs
  currentPreviewLang: '', // Active language in the preview tabs
  
  // Session Stats (Updates dynamically in dashboard)
  stats: {
    filesTranslated: 0,
    languagesUsed: new Set(),
    charactersProcessed: 0,
    successRate: 100,
    totalRequests: 0,
    failedRequests: 0
  },

  // Track previous stats for counter animations
  prevStats: {
    filesTranslated: 0,
    languagesUsed: 0,
    charactersProcessed: 0,
    successRate: 100
  }
};

// Available languages list
const LANGUAGES = {
  en: 'English',
  hi: 'Hindi',
  ta: 'Tamil',
  te: 'Telugu',
  ml: 'Malayalam',
  fr: 'French',
  es: 'Spanish',
  de: 'German'
};

// DOM Elements
const dropzone = document.getElementById('dropzone');
const fileInput = document.getElementById('fileInput');
const fileInfoBar = document.getElementById('fileInfoBar');
const fileNameEl = document.getElementById('fileName');
const fileSizeEl = document.getElementById('fileSize');
const removeFileBtn = document.getElementById('removeFileBtn');
const textInputArea = document.getElementById('textInputArea');
const sourceLangSelect = document.getElementById('sourceLangSelect');
const langSuggestBox = document.getElementById('langSuggestBox');
const translateBtn = document.getElementById('translateBtn');
const btnSpinner = document.getElementById('btnSpinner');
const btnText = document.getElementById('btnText');
const metaCharCount = document.getElementById('metaCharCount');
const metaEstTime = document.getElementById('metaEstTime');

// Output DOM Elements
const outputContent = document.getElementById('outputContent');
const outputEmptyState = document.getElementById('outputEmptyState');
const previewTabs = document.getElementById('previewTabs');
const compareLeftPane = document.getElementById('compareLeftPane');
const compareRightPane = document.getElementById('compareRightPane');
const compareLeftLabel = document.getElementById('compareLeftLabel');
const compareRightLabel = document.getElementById('compareRightLabel');
const downloadCardsGrid = document.getElementById('downloadCardsGrid');

// Dashboard Stats Elements
const statFilesVal = document.getElementById('statFilesVal');
const statLangsVal = document.getElementById('statLangsVal');
const statCharsVal = document.getElementById('statCharsVal');
const statSuccessVal = document.getElementById('statSuccessVal');

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  updateDashboardUI();
});

// Event Listeners Configuration
function setupEventListeners() {
  // Drag and Drop files
  dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.classList.add('dragover');
  });

  dropzone.addEventListener('dragleave', () => {
    dropzone.classList.remove('dragover');
  });

  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('dragover');
    if (e.dataTransfer.files.length > 0) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  });

  dropzone.addEventListener('click', (e) => {
    // Only trigger if clicked dropzone directly or text within it, avoid file button click loop
    if (e.target.tagName !== 'BUTTON') {
      fileInput.click();
    }
  });

  const uploadBtn = dropzone.querySelector('.btn-glass-upload');
  if (uploadBtn) {
    uploadBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      fileInput.click();
    });
  }

  fileInput.addEventListener('change', () => {
    if (fileInput.files.length > 0) {
      handleFileSelection(fileInput.files[0]);
    }
  });

  removeFileBtn.addEventListener('click', (e) => {
    e.stopPropagation(); // Avoid triggering dropzone click
    clearActiveFile();
  });

  // Track raw text input changes
  textInputArea.addEventListener('input', (e) => {
    state.inputText = e.target.value;
    if (state.inputText && !state.activeFile) {
      // Trigger character count updates dynamically for typed input
      const format = getRawTextFormat();
      const formatLabel = format.charAt(0).toUpperCase() + format.slice(1);
      updatePipelineMeta(state.inputText.length, null, formatLabel);
      debounceDetectLanguage(state.inputText);
    } else if (!state.inputText && !state.activeFile) {
      updatePipelineMeta(0, null, 'Text');
      langSuggestBox.innerHTML = '';
      sourceLangSelect.value = 'auto';
    }
  });

  // Language checkboxes click delegation
  const langCheckboxes = document.querySelectorAll('.lang-checkbox-label input[type="checkbox"]');
  langCheckboxes.forEach(cb => {
    // Initialize initial visual state
    const label = cb.closest('.lang-checkbox-label');
    if (cb.checked) {
      label.classList.add('selected');
    }
    
    cb.addEventListener('change', (e) => {
      const label = cb.closest('.lang-checkbox-label');
      const langCode = cb.value;
      
      if (cb.checked) {
        label.classList.add('selected');
        if (!state.selectedTargetLangs.includes(langCode)) {
          state.selectedTargetLangs.push(langCode);
        }
      } else {
        label.classList.remove('selected');
        state.selectedTargetLangs = state.selectedTargetLangs.filter(l => l !== langCode);
      }
    });
  });

  // Translate Trigger
  translateBtn.addEventListener('click', startTranslationPipeline);
}

// File Selection Handler
async function handleFileSelection(file) {
  // Validate file size (limit to 10MB)
  if (file.size > 10 * 1024 * 1024) {
    alert('File size exceeds the limit of 10MB.');
    return;
  }

  // Display file info
  fileNameEl.textContent = file.name;
  fileSizeEl.textContent = formatBytes(file.size);
  dropzone.style.display = 'none';
  fileInfoBar.style.display = 'flex';
  textInputArea.disabled = true;
  textInputArea.placeholder = 'Raw text input disabled while file is uploaded.';

  // Show loading indicator in file name area
  fileNameEl.innerHTML = `${file.name} <span style="color:var(--accent-primary); font-size:0.85rem; margin-left:10px;">(Processing...)</span>`;

  const formData = new FormData();
  formData.append('file', file);

  try {
    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });

    if (!res.ok) {
      throw new Error('Failed to process file');
    }

    const data = await res.json();
    state.activeFile = data;

    // Reset name display and select detected source language
    fileNameEl.textContent = file.name;
    sourceLangSelect.value = data.detectedLang;
    
    // Character counts & estimation
    const formatLabel = data.format.charAt(0).toUpperCase() + data.format.slice(1);
    updatePipelineMeta(data.charCount, data.estimatedTimeSec, formatLabel);
    
    // Render target language suggestions
    renderSuggestedTargetLanguages(data.suggestedTargetLangs);

  } catch (err) {
    console.error('Error uploading file:', err);
    alert('Failed to process uploaded file structure. Please try a text, HTML, JSON or Markdown file.');
    clearActiveFile();
  }
}

// Clear Active Upload File
function clearActiveFile() {
  state.activeFile = null;
  fileInput.value = '';
  fileInfoBar.style.display = 'none';
  dropzone.style.display = 'flex';
  textInputArea.disabled = false;
  textInputArea.placeholder = 'Type or paste your content here...';
  
  if (state.inputText) {
    const format = getRawTextFormat();
    const formatLabel = format.charAt(0).toUpperCase() + format.slice(1);
    updatePipelineMeta(state.inputText.length, null, formatLabel);
    debounceDetectLanguage(state.inputText);
  } else {
    updatePipelineMeta(0, null, 'Text');
    sourceLangSelect.value = 'auto';
    langSuggestBox.innerHTML = '';
  }
}

// Language Auto-Detection for Raw Text
let detectTimeout;
function debounceDetectLanguage(text) {
  clearTimeout(detectTimeout);
  if (text.length < 5) return;
  
  detectTimeout = setTimeout(async () => {
    try {
      const res = await fetch('/api/detect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      if (res.ok) {
        const { lang } = await res.json();
        sourceLangSelect.value = lang;
        
        // Render target language suggestions
        const suggestList = Object.keys(LANGUAGES)
          .filter(code => code !== lang)
          .map(code => ({ code, name: LANGUAGES[code] }))
          .slice(0, 4);
        renderSuggestedTargetLanguages(suggestList);
      }
    } catch (err) {
      console.error('Detection failed:', err);
    }
  }, 800);
}

// Render Suggested Languages badge
function renderSuggestedTargetLanguages(list) {
  if (!list || list.length === 0) {
    langSuggestBox.innerHTML = '';
    return;
  }
  const badgesHtml = list.map(lang => 
    `<span class="suggested-badge" style="cursor:pointer;" onclick="selectTargetLanguage('${lang.code}')">+ ${lang.name}</span>`
  ).join(' ');
  
  langSuggestBox.innerHTML = `<span class="label-text" style="font-size:0.75rem; margin-right:6px;">Suggested Targets:</span> ${badgesHtml}`;
}

// Expose selection trigger from suggestions click
window.selectTargetLanguage = function(langCode) {
  const cb = document.querySelector(`.lang-checkbox-label input[value="${langCode}"]`);
  if (cb && !cb.checked) {
    cb.checked = true;
    cb.dispatchEvent(new Event('change'));
  }
};

// Update pipeline metadata (characters, speed estimate, format name)
function updatePipelineMeta(charCount, timeSec = null, formatName = 'Text') {
  metaCharCount.textContent = charCount.toLocaleString();
  const calculatedTime = timeSec !== null ? timeSec : Math.max(0.3, Math.round((charCount * 0.0005) * 10) / 10);
  metaEstTime.textContent = `${calculatedTime}s`;
  const formatEl = document.getElementById('metaFormat');
  if (formatEl) {
    formatEl.textContent = formatName;
  }
}

// Orchestrate the translation request
async function startTranslationPipeline() {
  const isFile = !!state.activeFile;
  const content = isFile ? null : state.inputText;
  const filename = isFile ? state.activeFile.filename : null;
  const format = isFile ? state.activeFile.format : getRawTextFormat();
  
  // Validation
  if (!isFile && (!content || !content.trim())) {
    alert('Please upload a file or write some text to translate.');
    return;
  }
  
  if (state.selectedTargetLangs.length === 0) {
    alert('Please select at least one target language.');
    return;
  }

  // Loading state
  setLoadingState(true);
  state.stats.totalRequests++;

  try {
    const payload = {
      text: content,
      filename,
      targetLangs: state.selectedTargetLangs,
      format,
      sourceLang: sourceLangSelect.value
    };

    const res = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      throw new Error('Translation failed');
    }

    const result = await res.json();
    state.translations = result.translations;
    state.downloadUrls = result.downloadUrls;

    // Update in-memory session analytics
    state.stats.filesTranslated += isFile ? 1 : 0;
    state.selectedTargetLangs.forEach(lang => state.stats.languagesUsed.add(lang));
    state.stats.charactersProcessed += (isFile ? state.activeFile.charCount : state.inputText.length) * state.selectedTargetLangs.length;
    
    updateDashboardUI();

    // Setup output preview UI
    renderTranslationOutput(result.originalName, format, content || 'Processing file content...');

  } catch (err) {
    console.error('Translation pipeline error:', err);
    state.stats.failedRequests++;
    updateDashboardUI();
    alert('Translation pipeline encountered an error. Please try again.');
  } finally {
    setLoadingState(false);
  }
}

// Render Results Output: Preview, Compare, Download
function renderTranslationOutput(originalName, format, sourceContent) {
  // Hide empty state and show output content
  if (outputEmptyState) outputEmptyState.style.display = 'none';
  if (outputContent) outputContent.style.display = 'block';
  
  // Render tabs
  const activeLang = state.selectedTargetLangs[0];
  state.currentPreviewLang = activeLang;
  
  previewTabs.innerHTML = state.selectedTargetLangs.map(lang => 
    `<button class="tab-btn ${lang === activeLang ? 'active' : ''}" onclick="switchPreviewLanguage('${lang}')">${LANGUAGES[lang]}</button>`
  ).join('');

  // Handle source content preview. If it's a file, we read from file or display static representation.
  let displaySource = sourceContent;
  if (state.activeFile) {
    displaySource = `[Source File: ${originalName}]\n\nFormat: ${format.toUpperCase()}\nCharacters: ${state.activeFile.charCount}\n\nTranslations have been completed and are ready to preview. Select language tabs above to compare.`;
  }

  // Update Split Panes
  updateSplitPanes(displaySource, state.translations[activeLang], format);

  // Render Download Cards
  renderDownloadCards(originalName);

  // Scroll to output
  document.getElementById('outputPanel').scrollIntoView({ behavior: 'smooth' });
}

// Switch Language Tab in Preview
window.switchPreviewLanguage = function(langCode) {
  state.currentPreviewLang = langCode;
  
  // Toggle tab buttons class
  const tabs = previewTabs.querySelectorAll('.tab-btn');
  tabs.forEach(btn => {
    if (btn.textContent === LANGUAGES[langCode]) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // Update right pane preview
  const format = state.activeFile ? state.activeFile.format : getRawTextFormat();
  let sourceText = state.inputText;
  if (state.activeFile) {
    sourceText = `[Source File: ${state.activeFile.originalName}]\n\nFormat: ${format.toUpperCase()}\nCharacters: ${state.activeFile.charCount}\n\nTranslations have been completed and are ready to preview. Select language tabs above to compare.`;
  }

  updateSplitPanes(sourceText, state.translations[langCode], format);
};

// Update Compare Split Content
function updateSplitPanes(source, translated, format) {
  compareLeftLabel.textContent = `Source (${sourceLangSelect.value === 'auto' ? 'Auto-Detected' : LANGUAGES[sourceLangSelect.value] || 'Detected'})`;
  compareRightLabel.textContent = `Translated (${LANGUAGES[state.currentPreviewLang]})`;

  // Apply typography based on format (mono code view or outfit)
  const isCode = ['json', 'html', 'markdown', 'code'].includes(format);
  
  if (isCode) {
    compareLeftPane.classList.add('code-view');
    compareRightPane.classList.add('code-view');
  } else {
    compareLeftPane.classList.remove('code-view');
    compareRightPane.classList.remove('code-view');
  }

  // Double check if it's HTML/JSON and escape content for visual display so tag is visible
  if (format === 'html' || format === 'json') {
    compareLeftPane.textContent = source;
    compareRightPane.textContent = translated;
  } else {
    compareLeftPane.textContent = source;
    compareRightPane.textContent = translated;
  }
}

// Render Download Cards
function renderDownloadCards(originalName) {
  downloadCardsGrid.innerHTML = state.selectedTargetLangs.map(lang => {
    const downloadUrl = state.downloadUrls[lang];
    const targetName = LANGUAGES[lang];
    const transSize = state.translations[lang].length;

    return `
      <div class="download-card">
        <div class="dl-card-info">
          <div class="dl-card-icon">📁</div>
          <div>
            <div class="dl-card-lang">${targetName} Translation</div>
            <div class="dl-card-meta">${transSize.toLocaleString()} chars • UTF-8 format</div>
          </div>
        </div>
        <a href="${downloadUrl}" download class="btn-download-file" title="Download ${targetName} file">
          <span>↓</span>
        </a>
      </div>
    `;
  }).join('');
}

// Helper to determine raw text format (json/html/md/code/text)
function getRawTextFormat() {
  const text = state.inputText.trim();
  if (text.startsWith('{') && text.endsWith('}')) return 'json';
  if (text.startsWith('[') && text.endsWith(']')) return 'json';
  if (text.startsWith('<') && text.endsWith('>')) return 'html';
  if (text.includes('# ') || text.includes('**') || text.includes('```')) return 'markdown';
  
  // Detect programming code snippet
  if (
    text.includes('console.log') ||
    text.includes('function ') ||
    text.includes('def ') ||
    text.includes('import ') ||
    text.includes('const ') ||
    text.includes('let ') ||
    text.includes('var ') ||
    text.includes('public class ') ||
    text.includes('cout <<') ||
    text.includes('System.out.print') ||
    /^[a-zA-Z_$][a-zA-Z0-9_$]*\([^)]*\);?$/.test(text)
  ) {
    return 'code';
  }
  
  return 'text';
}

// Toggle loading state on translate button
function setLoadingState(isLoading) {
  if (isLoading) {
    translateBtn.disabled = true;
    btnSpinner.style.display = 'inline-block';
    btnText.textContent = 'Translating...';
  } else {
    translateBtn.disabled = false;
    btnSpinner.style.display = 'none';
    btnText.textContent = 'Translate Content';
  }
}

// Animated counter functions
function animateValue(element, start, end, duration = 800) {
  if (!element) return;
  let startTimestamp = null;
  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    element.textContent = Math.floor(progress * (end - start) + start).toLocaleString();
    if (progress < 1) {
      window.requestAnimationFrame(step);
    }
  };
  window.requestAnimationFrame(step);
}

function animateValueCompact(element, start, end, duration = 800) {
  if (!element) return;
  let startTimestamp = null;
  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    const currentVal = Math.floor(progress * (end - start) + start);
    element.textContent = formatCompactNumber(currentVal);
    if (progress < 1) {
      window.requestAnimationFrame(step);
    }
  };
  window.requestAnimationFrame(step);
}

function animateValuePercent(element, start, end, duration = 800) {
  if (!element) return;
  let startTimestamp = null;
  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    element.textContent = `${Math.floor(progress * (end - start) + start)}%`;
    if (progress < 1) {
      window.requestAnimationFrame(step);
    }
  };
  window.requestAnimationFrame(step);
}

// Update dashboard numeric widgets with animations
function updateDashboardUI() {
  const newFiles = state.stats.filesTranslated;
  const newLangs = state.stats.languagesUsed.size;
  const newChars = state.stats.charactersProcessed;
  let newSuccess = 100;
  
  if (state.stats.totalRequests > 0) {
    newSuccess = Math.round(((state.stats.totalRequests - state.stats.failedRequests) / state.stats.totalRequests) * 100);
  }

  animateValue(statFilesVal, state.prevStats.filesTranslated, newFiles);
  animateValue(statLangsVal, state.prevStats.languagesUsed, newLangs);
  animateValueCompact(statCharsVal, state.prevStats.charactersProcessed, newChars);
  animateValuePercent(statSuccessVal, state.prevStats.successRate, newSuccess);

  // Store current state as previous for next run
  state.prevStats.filesTranslated = newFiles;
  state.prevStats.languagesUsed = newLangs;
  state.prevStats.charactersProcessed = newChars;
  state.prevStats.successRate = newSuccess;
}

// Utility formats
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatCompactNumber(num) {
  if (num >= 1e6) {
    return (num / 1e6).toFixed(1) + 'M';
  }
  if (num >= 1e3) {
    return (num / 1e3).toFixed(1) + 'K';
  }
  return num;
}
