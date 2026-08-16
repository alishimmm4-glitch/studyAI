const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const { ALLOWED_NOTE_EXTENSIONS, ALLOWED_NOTE_MIME_TYPES } = require("../config/constants");

const uploadDir = path.join(process.cwd(), process.env.UPLOAD_DIR || "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = crypto.randomBytes(8).toString("hex");
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${unique}${ext}`);
  },
});

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

module.exports = { uploadNote, uploadDir };
