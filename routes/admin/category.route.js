import express from 'express';
import asyncHandler from '../../middlewares/asyncHandler.js';
import controller from '../../controllers/admin/category.controller.js';

const router = express.Router();

router.get('/list', asyncHandler(controller.list));
router.get('/detail/:id', asyncHandler(controller.detail));
router.get('/add', asyncHandler(controller.getAdd));
router.get('/edit/:id', asyncHandler(controller.getEdit));
router.post('/add', asyncHandler(controller.postAdd));
router.post('/edit', asyncHandler(controller.postEdit));
router.post('/delete', asyncHandler(controller.postDelete));

export default router;