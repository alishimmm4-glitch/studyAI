const path = require("path");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");

/**
 * Extracts raw text from an in-memory file buffer (PDF or DOCX).
 * Works on any hosting model — traditional server or serverless — since it
 * never touches disk. Returns an empty string (never throws) on failure so
 * the calling controller can degrade gracefully instead of 500-ing.
 */
async function extractTextFromBuffer(buffer, originalName) {
  const ext = path.extname(originalName).toLowerCase();
  try {
    if (ext === ".pdf") {
      const result = await pdfParse(buffer);
      return result.text || "";
    }
    if (ext === ".docx") {
      const result = await mammoth.extractRawText({ buffer });
      return result.value || "";
    }
    // .doc (legacy binary word format) has no reliable pure-JS parser;
    // we still store the note but skip text extraction.
    return "";
  } catch (err) {
    console.error(`Text extraction failed for ${originalName}: ${err.message}`);
    return "";
  }
}

module.exports = extractTextFromBuffer;
