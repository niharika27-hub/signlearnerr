import multer from "multer";

const storage = multer.memoryStorage();

function imageFileFilter(_request, file, callback) {
  if (file.mimetype?.startsWith("image/")) {
    callback(null, true);
    return;
  }

  callback(new Error("Only image files are allowed."));
}

export const avatarUpload = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 3 * 1024 * 1024,
  },
});
