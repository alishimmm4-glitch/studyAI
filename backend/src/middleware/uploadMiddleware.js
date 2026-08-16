const multer = require("multer");
const path = require("path");
const { ALLOWED_NOTE_EXTENSIONS, ALLOWED_NOTE_MIME_TYPES } = require("../config/constants");

/**
 * Uses in-memory storage (buffer, not disk) so this works identically on a
 * normal server AND on serverless platforms like Netlify Functions, where
 * the filesystem is read-only/ephemeral. The file is only ever needed
 * transiently to extract text, so there's no need to persist it anywhere.
 */
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const okExt = ALLOWED_NOTE_EXTENSIONS.includes(ext);
  const okMime = ALLOWED_NOTE_MIME_TYPES.includes(file.mimetype);
  if (okExt && okMime) return cb(null, true);
  cb(new Error("Only PDF, DOC, and DOCX files are supported"));
};

const maxSizeMb = Number(process.env.MAX_FILE_SIZE_MB || 20);

const uploadNote = multer({
  storage,
  fileFilter,
  limits: { fileSize: maxSizeMb * 1024 * 1024 },
});

module.exports = { uploadNote };
