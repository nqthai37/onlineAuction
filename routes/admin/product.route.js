import express from 'express';
import asyncHandler from '../../middlewares/asyncHandler.js';
import controller from '../../controllers/admin/product.controller.js';
import multer from 'multer';

const router = express.Router();

router.get('/list', asyncHandler(controller.list));
router.get('/add', asyncHandler(controller.getAdd));
router.post('/add', asyncHandler(controller.postAdd));
router.get('/detail/:id', asyncHandler(controller.detail));
router.get('/edit/:id', asyncHandler(controller.editPage));
router.post('/edit', asyncHandler(controller.postEdit));
router.post('/delete', asyncHandler(controller.postDelete));

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

router.post('/upload-thumbnail', upload.single('thumbnail'), asyncHandler(controller.uploadThumbnail));
router.post('/upload-subimages', upload.array('images', 10), asyncHandler(controller.uploadSubimages));

export default router;