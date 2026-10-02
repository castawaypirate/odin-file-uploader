import multer from "multer";
import path from "path";

// we will use it for cloudinary
const storage = multer.memoryStorage();

const upload = multer({
  // storage: storage,
  dest: "./public/uploads/",
  limits: {
    fileSize: 2 * 1024 * 1024,
  },
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});

function checkFileType(file, cb) {
  const allowedExtensions = [
    // Images
    ".png",
    ".jpg",
    ".jpeg",
    ".gif",
    ".webp",
    // Documents
    ".pdf",
    ".txt",
    ".csv",
    ".doc",
    ".docx", // Word
    ".xls",
    ".xlsx", // Excel
    ".ppt",
    ".pptx", // PowerPoint
    // Archives
    ".zip",
    ".rar",
    ".7z",
    // Media (Include these only if your server RAM/storage can handle them)
    ".mp4",
    ".mp3",
  ];

  const allowedMimeTypes = [
    // Images
    "image/png",
    "image/jpeg",
    "image/gif",
    "image/webp",
    // Documents
    "application/pdf",
    "text/plain",
    "text/csv",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // docx
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // xlsx
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation", // pptx
    // Archives
    "application/zip",
    "application/x-rar-compressed",
    "application/x-7z-compressed",
    // Media
    "video/mp4",
    "audio/mpeg",
  ];

  const extname = allowedExtensions.includes(
    path.extname(file.originalname).toLowerCase(),
  );
  const mimetype = allowedMimeTypes.includes(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    const error = new Error("This file type is not supported");
    error.code = "LIMIT_FILE_TYPE";

    return cb(error);

    // this will ignore the file and silently fail instead of raising an error
    // return cb(null, false);
  }
}

export { upload };
