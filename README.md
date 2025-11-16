🌍 PolyTranslate
Multilingual text & file translation made simple — powered by Lingo CLI

PolyTranslate is a lightweight, developer-friendly multilingual translation tool built using Node.js, Lingo CLI, and a clean HTML/CSS demo interface.
It instantly generates translations for text & files across multiple languages with a smooth CLI workflow and a polished UI demo.

🚀 Live Demo: https://polytranslate.netlify.app

📦 GitHub: https://github.com/NandaGunasri/polytranslate

⭐ Features
🔤 Bulk file translation using Lingo CLI
🌐 Instant text translation across multiple languages
🤖 Auto language detection (via Lingo)
📁 Text & file input support
📦 Clean CLI pipeline for developers
🎨 Modern UI demo for hackathon judges
⚡ No frameworks needed — works with pure JS & HTML

📂 Project Structure
polytranslate/
│
├── input/              # Input text files to translate
├── public/             # Website demo (HTML/CSS/JS)
│   ├── index.html
│   ├── logo.svg
│
├── translations/       # Auto-generated translations (output)
├── index.js            # Node.js script using Lingo CLI
├── package.json
└── README.md

🛠 Tech Stack

Frontend:
HTML
CSS
JavaScript
Backend / CLI:
Node.js
Lingo CLI

Deployment:
Netlify
🚀 How It Works
1️⃣ Install dependencies
npm install
2️⃣ Add your input files
Place text files inside:
/input/example.txt
3️⃣ Run translation
node index.js
This script:
✔ Reads input files
✔ Runs translation via Lingo CLI
✔ Outputs translations to /translations/<lang>/...

💡 Languages Supported
(As included in the demo)
Hindi (hi)
Tamil (ta)
Telugu (te)
French (fr)
Spanish (es)
German (de)

You can add more easily by editing the array inside index.js.
🎨 UI Demo Preview
The demo at https://polytranslate.netlify.app
 lets users:
Type any text
Choose a language
Get instant sample translation (UI-only)
Clear UX to show judges how the real translation pipeline works in backend
🧠 Why I Built This
To make it extremely easy for developers to globalize their apps using Lingo CLI — with a real UI, real CLI pipeline, and clean structure.

🏆 Hackathon Notes (Required)
This project uses Lingo CLI for:
Multilingual pipeline generation
Translating files inside /input
Generating output inside /translations
Automating workflows with Node.js
AI tools such as ChatGPT were used only for documentation, UI polishing, and idea refinement.
Not for auto-generating code.

👤 Author
Guna Sri (NandaGunasri)
Developer • Student • Builder
