import { readFile, writeFile } from "node:fs/promises";
import { PDFParse } from "pdf-parse";

const PDF_PATH = "data/raw/bc-conservatives-2026.pdf";
const OUT_PATH = "data/raw/bc-conservatives-2026.txt";

async function main() {
  const buffer = await readFile(PDF_PATH);
  const parser = new PDFParse({ data: buffer });

  try {
    const result = await parser.getText();
    await writeFile(OUT_PATH, result.text, "utf8");
    console.log(`Wrote ${OUT_PATH} (${result.text.length} chars)`);
  } finally {
    await parser.destroy();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
