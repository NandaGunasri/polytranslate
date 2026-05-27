import express from 'express';
import multer from 'multer';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { translateContent, detectLanguage } from './src/translator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Setup directories
const UPLOADS_DIR = path.join(__dirname, 'uploads');
const TRANSLATIONS_DIR = path.join(__dirname, 'translations');

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}
if (!fs.existsSync(TRANSLATIONS_DIR)) {
  fs.mkdirSync(TRANSLATIONS_DIR, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    // Keep original filename but prepend timestamp to prevent name collision
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ storage });

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve static frontend files
app.use(express.static(path.join(__dirname, 'public')));

// Upload file metadata endpoint
app.post('/api/upload', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    const filePath = req.file.path;
    const content = fs.readFileSync(filePath, 'utf-8');
    const charCount = content.length;
    const ext = path.extname(req.file.originalname).toLowerCase();
    
    // Auto-detect format
    let format = 'text';
    if (ext === '.html' || ext === '.htm') format = 'html';
    else if (ext === '.json') format = 'json';
    else if (ext === '.md') format = 'markdown';
    else if (['.js', '.ts', '.py', '.cpp', '.h', '.cs', '.go', '.java'].includes(ext)) {
      format = 'code';
    }

    // Auto-detect language
    const detectedLang = await detectLanguage(content);

    // Suggest target languages based on detected source language
    const languages = [
      { code: 'hi', name: 'Hindi' },
      { code: 'ta', name: 'Tamil' },
      { code: 'te', name: 'Telugu' },
      { code: 'ml', name: 'Malayalam' },
      { code: 'fr', name: 'French' },
      { code: 'es', name: 'Spanish' },
      { code: 'de', name: 'German' }
    ];
    const suggestedTargetLangs = languages.filter(l => l.code !== detectedLang).slice(0, 4);

    // Estimate translation time (50ms per 100 chars, min 300ms)
    const estimatedTimeSec = Math.max(0.3, Math.round((charCount * 0.0005) * 10) / 10);

    return res.json({
      filename: req.file.filename,
      originalName: req.file.originalname,
      format,
      charCount,
      detectedLang,
      suggestedTargetLangs,
      estimatedTimeSec
    });
  } catch (err) {
    console.error('Upload API error:', err);
    return res.status(500).json({ error: 'Failed to process uploaded file' });
  }
});

// Translation API endpoint (batch translation for text or files)
app.post('/api/translate', async (req, res) => {
  const { text, filename, targetLangs, format, sourceLang } = req.body;

  if (!targetLangs || !Array.isArray(targetLangs) || targetLangs.length === 0) {
    return res.status(400).json({ error: 'Target languages must be a non-empty array' });
  }

  try {
    let content = '';
    let originalName = 'snippet.txt';
    let fileExt = 'txt';

    if (filename) {
      const filePath = path.join(UPLOADS_DIR, filename);
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'Uploaded file not found' });
      }
      content = fs.readFileSync(filePath, 'utf-8');
      originalName = filename.substring(filename.indexOf('-') + 1);
      fileExt = path.extname(originalName).slice(1);
    } else if (text) {
      content = text;
      fileExt = format === 'json' ? 'json' : format === 'html' ? 'html' : format === 'markdown' ? 'md' : 'txt';
      originalName = `snippet.${fileExt}`;
    } else {
      return res.status(400).json({ error: 'Either text or filename must be provided' });
    }

    const translations = {};
    const downloadUrls = {};

    // Process all target translations in parallel
    await Promise.all(
      targetLangs.map(async (lang) => {
        try {
          const translatedContent = await translateContent(content, format || 'text', lang, fileExt);
          translations[lang] = translatedContent;

          // Save translated file to disk
          const outputFilename = `translated_${lang}_${Date.now()}_${originalName}`;
          const outputPath = path.join(TRANSLATIONS_DIR, outputFilename);
          fs.writeFileSync(outputPath, translatedContent, 'utf-8');

          downloadUrls[lang] = `/api/download?file=${encodeURIComponent(outputFilename)}&name=${encodeURIComponent(originalName)}`;
        } catch (langErr) {
          console.error(`Error translating to ${lang}:`, langErr);
          translations[lang] = `[Translation Error for ${lang}]`;
        }
      })
    );

    return res.json({
      success: true,
      originalName,
      format: format || 'text',
      charCount: content.length,
      translations,
      downloadUrls
    });
  } catch (err) {
    console.error('Translate API error:', err);
    return res.status(500).json({ error: 'Translation pipeline failed' });
  }
});

// Download endpoint
app.get('/api/download', (req, res) => {
  const { file, name } = req.query;

  if (!file) {
    return res.status(400).json({ error: 'File parameter is required' });
  }

  const filePath = path.join(TRANSLATIONS_DIR, file);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found' });
  }

  // Prepend language code to downloaded filename if possible
  let downloadName = name || 'translated_file';
  const match = file.match(/^translated_([a-z]{2})_/);
  if (match) {
    const lang = match[1];
    const dotIndex = downloadName.lastIndexOf('.');
    if (dotIndex !== -1) {
      downloadName = `${downloadName.substring(0, dotIndex)}_${lang}${downloadName.substring(dotIndex)}`;
    } else {
      downloadName = `${downloadName}_${lang}`;
    }
  }

  res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(downloadName)}"`);
  res.setHeader('Content-Type', 'application/octet-stream');
  
  const fileStream = fs.createReadStream(filePath);
  fileStream.pipe(res);
});

// Detect language endpoint
app.post('/api/detect', async (req, res) => {
  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ error: 'Text content is required' });
  }
  try {
    const lang = await detectLanguage(text);
    return res.json({ lang });
  } catch (err) {
    return res.status(500).json({ error: 'Detection failed' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 PolyTranslate X Server running on http://localhost:${PORT}`);
});
