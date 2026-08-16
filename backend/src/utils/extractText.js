const fs = require("fs");
const path = require("path");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");

/**
 * Extracts raw text from an uploaded PDF or DOCX file on disk.
 * Returns an empty string (never throws) if extraction fails, so the
 * calling controller can degrade gracefully instead of 500-ing.
 */
async function extractTextFromFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  try {
    if (ext === ".pdf") {
      const buffer = fs.readFileSync(filePath);
      const result = await pdfParse(buffer);
      return result.text || "";
    }
    if (ext === ".docx") {
      const result = await mammoth.extractRawText({ path: filePath });
      return result.value || "";
    }
    // .doc (legacy binary word format) has no reliable pure-JS parser;
    // we store the file but skip text extraction.
    return "";
  } catch (err) {
    console.error(`Text extraction failed for ${filePath}: ${err.message}`);
    return "";
  }
}

module.exports = extractTextFromFile;
