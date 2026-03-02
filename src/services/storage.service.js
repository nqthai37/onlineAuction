import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Utilities for file operations (uploads, moving, etc.)
// All file system logic should live here rather than in models.

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicPath = path.join(__dirname, '..', 'public');

/**
 * Move uploaded files from temp folder to a permanent location.
 * @param {Array<string>} tempUrls
 * @param {'payment_proofs'|'shipping_proofs'|'products'|string} type
 * @returns {Array<string>} array of new URLs relative to public/
 */
export function moveUploadedFiles(tempUrls, type) {
  if (!tempUrls || tempUrls.length === 0) return [];

  const targetPath = path.join(publicPath, 'images', type);
  if (!fs.existsSync(targetPath)) {
    fs.mkdirSync(targetPath, { recursive: true });
  }

  const permanentUrls = [];
  for (const tempUrl of tempUrls) {
    const tempFilename = path.basename(tempUrl);
    const tempPath = path.join(publicPath, tempUrl);
    const ext = path.extname(tempFilename);
    const timestamp = Date.now();
    const random = Math.round(Math.random() * 1e9);
    const newFilename = `${timestamp}-${random}${ext}`;
    const newPath = path.join(targetPath, newFilename);
    const newUrl = `images/${type}/${newFilename}`;

    try {
      if (fs.existsSync(tempPath)) {
        fs.renameSync(tempPath, newPath);
        permanentUrls.push(newUrl);
      } else {
        console.warn(`Temp file not found: ${tempPath}`);
      }
    } catch (err) {
      console.error(`Error moving file ${tempUrl}:`, err);
    }
  }

  return permanentUrls;
}
