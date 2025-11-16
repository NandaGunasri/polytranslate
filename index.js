import { exec } from "child_process";
import fs from "fs";

const inputFile = "./input/example.txt";
const outputFolder = "./translations/output";

const languages = ["hi", "ta", "te", "ml", "fr", "es", "de"];

if (!fs.existsSync(outputFolder)) {
  fs.mkdirSync(outputFolder, { recursive: true });
}

const content = fs.readFileSync(inputFile, "utf-8");

console.log("🔄 Translating using Lingo CLI...\n");

languages.forEach((lang) => {
  const outputFile = `${outputFolder}/translated_${lang}.txt`;
  const command = `echo "${content}" | lingo translate --to ${lang}`;

  exec(command, (error, stdout) => {
    if (error) {
      console.error(`❌ Error translating to ${lang}:`, error);
      return;
    }

    fs.writeFileSync(outputFile, stdout);
    console.log(`✅ Saved: ${outputFile}`);
  });
});
