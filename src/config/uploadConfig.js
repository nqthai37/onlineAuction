import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Determine directory of this config file to compute relative paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// where product images will be stored
export const uploadDir = path.join(__dirname, '../public/images/products');

// create folder if it doesn't exist, ensures same behaviour previously in index.js
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// filter for allowed image types
export const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (jpeg, jpg, png, webp) are allowed!'));
  }
};
