🌍 PolyTranslate — Build Global from Day One

A Multilingual Translation Engine Powered by Lingo CLI
PolyTranslate is a fast, developer-friendly multilingual translation tool built for the WeMakeDevs Multilingual Hackathon.
It translates text and files into multiple languages using Lingo CLI, enabling developers to make their apps instantly global — without hiring translators or writing complex backend logic.

🚀 Features

🔤 Translate text into 15+ languages
📄 Translate entire files (txt, md, json, etc.)
🌐 Auto-detect source language
🗂️ Generate translated files in bulk
⚡ Super-simple Node.js script
🖥️ Optional clean web UI
🧠 100% powered by Lingo CLI, no external translation APIs

🧩 How It Works

PolyTranslate connects your app or script with Lingo CLI:
User inputs text or a file
Node.js script processes input
Script invokes Lingo CLI commands
Lingo returns translated output
Output saved into language-specific files
This pipeline makes the entire multilingual workflow automated, reliable, and incredibly easy.

🛠️ Tech Stack

Node.js (control logic)
JavaScript
HTML + CSS (sample interface)
Lingo CLI (translation engine)

GitHub (version control)

📦 Installation
git clone https://github.com/<your-username>/polytranslate
cd polytranslate
npm install
▶️ Run the Translator
node index.js


Translations will appear in:

/translations/output/
🧠 Using Lingo CLI
PolyTranslate uses the following Lingo features:
✔ lingo translate
To translate text into any supported language.
Example used internally:
echo "Hello World" | lingo translate --to hi
✔ Automatic language detection
Lingo identifies the input language automatically.
✔ Bulk pipeline
PolyTranslate loops through multiple languages and generates files automatically.

📁 Project Structure
polytranslate/
│
├── index.js
├── package.json
├── README.md
├── input/
│   └── example.txt
├── public/
│   └── index.html
└── translations/
    └── output/

🎥 Demo Video (For Submission)

Upload to YouTube and replace this placeholder:
➡️ 

📚 Learning & Growth (Hackathon Requirement)

This project taught:

how to integrate CLI tools with Node.js

automating multilingual pipelines

understanding language codes & formats

creating clean developer tools

designing simple UI for demos

🤝 Author

Guna Sri
B.Tech CSE | 3rd Year