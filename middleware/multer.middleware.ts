import multer, { StorageEngine } from "multer";
import path from "path";

// Define where and how the uploaded file will be stored locally
const storage: StorageEngine = multer.diskStorage({
  // Folder where file will be temporarily stored
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../public/temp"));
  },

  // Define how file name will be saved
  filename: (req, file, cb) => {
    cb(null, file.originalname); // Keep original name
  },
});

// Create upload instance using the defined storage config
const upload = multer({ storage });

export { upload };
