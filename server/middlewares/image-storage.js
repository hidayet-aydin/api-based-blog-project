const fs = require("fs");
const multer = require("multer");

const fileStoragePath = "./storage";
if (!fs.existsSync(fileStoragePath)) {
  fs.mkdirSync(fileStoragePath);
}

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, fileStoragePath);
  },
  filename: (req, file, cb) => {
    cb(
      null,
      (new Date().toISOString() + "-" + file.originalname).replace(/:/g, "")
    );
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

module.exports = multer({
  storage: fileStorage,
  fileFilter: fileFilter,
}).single("image");
