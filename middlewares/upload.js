const multer = require("multer");
const path = require("path");

// Helper function to create storage for a given folder
const storageFor = (folder) =>
  multer.diskStorage({
    destination: (req, file, cb) => cb(null, `public/${folder}`),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
  });

// Middleware for single file
const singleUpload = (fieldName, folder = "uploads") => {
  return multer({ storage: storageFor(folder) }).single(fieldName);
};

// Middleware for multiple fields
const multipleUpload = (folder = "uploads") => {
  return multer({ storage: storageFor(folder) }).fields([
    { name: "productImage", maxCount: 1 },
    { name: "fileUpload", maxCount: 1 }
  ]);
};

// Predefined upload middlewares for convenience
const pdfUpload = singleUpload("file", "pdf");
const imageUpload = singleUpload("file", "images");
const videoUpload = singleUpload("file", "videos");

module.exports = {
  storageFor,
  singleUpload,
  multipleUpload,
  pdfUpload,
  imageUpload,
  videoUpload
};
