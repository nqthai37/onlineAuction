import express from 'express';
import asyncHandler from '../../middlewares/asyncHandler.js';
import controller from '../../controllers/admin/system.controller.js';

const router = express.Router();

router.get('/settings', asyncHandler(controller.getSettings));
router.post('/settings', asyncHandler(controller.postSettings));

export default router;
