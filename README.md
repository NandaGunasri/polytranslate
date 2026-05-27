# 🌍 PolyTranslate X
### Build Global from Day One — AI-Powered Multilingual Localization Platform

![Node.js](https://img.shields.io/badge/Node.js-339933?logo=node.js&logoColor=white)
![Lingo CLI](https://img.shields.io/badge/Lingo_CLI-000000)
![Netlify](https://img.shields.io/badge/Netlify-00C7B7?logo=netlify)
![HTML](https://img.shields.io/badge/HTML-E34F26?logo=html5&logoColor=white)
![CSS](https://img.shields.io/badge/CSS-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)

---

## 🚀 Overview

**PolyTranslate X** is an AI-powered multilingual localization platform designed to help developers, students, and creators translate content globally while preserving structure and usability. 

Unlike traditional translators, PolyTranslate X focuses directly on developer-friendly localization workflows.

### Supported Structures:
* 📝 **Text**: Standard paragraphs and documents
* 📂 **Files**: Custom text files and configurations
* 🌐 **HTML**: Preserves structure, classes, tags, and layouts
* 📦 **JSON**: Maintains nested keys while translating values
* 📄 **Markdown**: Retains links, tables, list structures, and blocks
* 💻 **Code**: Translates string literals and comments while protecting code syntax

### Preservation Quality:
* ✅ Formatting & layout structures
* ✅ Multilingual content boundaries
* ✅ Custom Unicode characters
* ✅ Output file naming configurations

---

## 🌐 Live Demo & Repository

* **Demo URL**: [https://polytranslate.netlify.app](https://polytranslate.netlify.app)
* **GitHub Repository**: [https://github.com/NandaGunasri/polytranslate](https://github.com/NandaGunasri/polytranslate)

---

## ❗ Problem Statement

Software localization remains a difficult, fragmented chore. Developers often struggle with:
- **Manual Translation**: Slow, error-prone copying and pasting.
- **Broken Formatting**: Tags, markup, or code breaking during translation.
- **Repeated Workflows**: Setting up localization pipelines over and over.
- **Translation Management**: Difficulty handling multiple files and target outputs.

Traditional tools translate text, but they rarely preserve the structure essential for software and developer workflows.

---

## 💡 Solution

PolyTranslate X provides an automated, structures-aware multilingual translation experience. 

```text
 Upload File / Paste Text
           ↓
   Detect Language
           ↓
   Translate Content
           ↓
  Preserve Structures (HTML/JSON/Code/Markdown)
           ↓
 Side-by-Side Comparison Preview
           ↓
   Download Outputs
```

---

## ✨ Features

- 🌍 **Multilingual Translation**: Seamless translation across multiple target languages simultaneously.
- 📁 **File Upload**: Drag-and-drop or select local files (supports `.txt`, `.html`, `.json`, `.md`, `.js`, `.py`).
- 🧠 **Automatic Language Detection**: Instantly identifies the input language for optimal configuration.
- 🧾 **HTML Preservation**: Translates page content while fully preserving tags and attributes.
- 📦 **JSON Preservation**: Preserves keys and nested structure while localizing string values.
- 💻 **Code Preservation**: Protects code syntax (JS/Python/etc.) and localizes only string literals/comments.
- ⚡ **Batch Translation**: Translates source content into multiple target languages in parallel.
- 📊 **Interactive Dashboard**: Features dynamic counters showing statistics like files, characters, and success rates.
- 📤 **Download Outputs**: Instantly exports translated outputs in UTF-8 format with language-prefixed filenames.
- 🎨 **Premium UI**: Glassmorphic dark theme, pill-shaped language selectors, and responsive layout.

---

## 🛠 Tech Stack

- **Frontend**: HTML5, Vanilla CSS3 (Custom Glassmorphism), Modern JavaScript
- **Backend / API**: Node.js, Express, Multer
- **Localization Engine**: Lingo CLI & Google Translate API
- **Deployment**: Netlify (Frontend) / Node server hosting

---

## 📂 Project Structure

```plaintext
polytranslate/
│
├── bin/
│   └── lingo.js             # Lingo CLI executable wrapper
│
├── input/
│   └── example.txt          # Example text file for translation testing
│
├── public/                  # Frontend Static assets
│   ├── index.html           # Main Workspace dashboard
│   ├── styles.css           # Premium stylesheet
│   └── app.js               # Event handling and animated logic
│
├── src/
│   └── translator.js        # Core translation parser and dispatcher
│
├── translations/            # Output folder
│   └── output/              # CLI translation generated outputs
│
├── uploads/                 # Temporary file uploads folder
│
├── index.js                 # Local CLI batch translate script
├── package.json             # NPM dependencies & scripts configuration
└── README.md                # Platform documentation
```

---

## 🚀 Installation & Setup

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/NandaGunasri/polytranslate.git
   ```
2. **Navigate into the Project**:
   ```bash
   cd polytranslate
   ```
3. **Install Dependencies**:
   ```bash
   npm install
   ```
4. **Start the Local Server**:
   ```bash
   npm start
   ```
5. **Access the Workspace**:
   Open [http://localhost:3000](http://localhost:3000) in your web browser.

---

## 📘 Usage Instructions

1. **Upload or Enter Content**: Drop a file in the workspace or paste raw text.
2. **Automatic Detection**: The platform auto-detects the source format (HTML, JSON, Code, Markdown) and language.
3. **Select Targets**: Toggle one or more target language pills.
4. **Translate**: Click **Translate Content**.
5. **Preview & Compare**: Look at the side-by-side translation panes to inspect outputs.
6. **Download**: Click the download button next to each language card to export the files.

---

## 🧪 Example Testing Inputs

### 1. Plain Text
```text
Hello
```
*Expected Output*: Translated text (e.g. `నమస్కారం` in Telugu).

### 2. HTML Formatting
```html
<div>Hello</div>
```
*Expected Output*: Visible text translated, tags preserved exactly: `<div>నమస్కారం</div>`.

### 3. JSON Structure
```json
{"lang":"te"}
```
*Expected Output*: Keys and formatting preserved, values localized.

### 4. Code Syntax
```javascript
console.log("hello")
```
*Expected Output*: Code syntax untouched, string literal translated: `console.log("హలో")`.

---

## 🌎 Supported Languages

- English (`en`)
- Hindi (`hi`)
- Telugu (`te`)
- Tamil (`ta`)
- Malayalam (`ml`)
- French (`fr`)
- Spanish (`es`)
- German (`de`)

---

## 🖼 Screenshots

*Add screenshots here of the running app.*

```plaintext
/docs/home.png           - Landing Hero Page
/docs/workspace.png      - Active Workspace
/docs/translation.png    - Side-by-Side outputs
```

---

## ✅ Quality Assurance & Validation Rules

The project passes release QA under the following conditions:
- **✓ Translation generated**: Correct translation returned from APIs.
- **✓ HTML preserved**: Tags are untouched and structurally intact.
- **✓ JSON preserved**: JSON format remains parseable and keys are preserved.
- **✓ Code preserved**: JS/Python syntax remains compile-ready; only literals/comments translate.
- **✓ Unicode preserved**: Currency symbols (e.g., `₹`) and character sets are untampered.
- **✓ Download works**: Translated files trigger browser file downloads.
- **✓ Responsive UI**: Correct rendering on mobile, tablet, and desktop viewports.
- **✓ Performance**: Runs at 60fps with zero browser console exceptions.

---

## 🔮 Future Roadmap

- 🤖 **AI Translation Tuning**: Custom LLM translation prompt options.
- 📦 **Multi-format Exporters**: Export localized files to Android XML, iOS Strings, or CSV.
- ☁ **Cloud Synchronization**: Save translation setups and files in the cloud.
- 👥 **Team Workspaces**: Collaborate with developers and translators on active packages.
- 🧠 **Translation Memory**: Auto-complete matching segments using local caches.
- 📈 **Localization Analytics**: Visual reporting on translation progression.

---

## 🏆 Hackathon Notes

Built as a multilingual localization project.
- Uses **Lingo CLI** to automate localization workflows.
- Runs translation pipelines efficiently over local `/input` and `/translations` directories.
- **AI Assist Statement**: Generative AI tools were used for documentation preparation, UI theme design, and idea validation. Core platform logic and pipeline integrations were built natively.

---

## 👤 Author

**NandaGunasri**
*Developer • Student • Builder*
