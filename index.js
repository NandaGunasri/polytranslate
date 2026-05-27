import { exec } from "child_process";
import fs from "fs";
import path from "path";

const inputFile = "./input/example.txt";
const outputFolder = "./translations/output";

const languages = ["hi", "ta", "te", "ml", "fr", "es", "de"];

if (!fs.existsSync(outputFolder)) {
  fs.mkdirSync(outputFolder, { recursive: true });
}

console.log("🔄 Translating using Lingo CLI...\n");

languages.forEach((lang) => {
  const outputFile = `${outputFolder}/translated_${lang}.txt`;
  // Pass the file path directly to the CLI wrapper to avoid Windows echo/piping issues
  const command = `node ./bin/lingo.js translate --to ${lang} "${inputFile}"`;

  exec(command, (error, stdout) => {
    if (error) {
      console.error(`❌ Error translating to ${lang}:`, error);
      return;
    }

    fs.writeFileSync(outputFile, stdout);
    console.log(`✅ Saved: ${outputFile}`);
  });
});

