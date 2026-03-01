import express from 'express';
import asyncHandler from '../../middlewares/asyncHandler.js';
import controller from '../../controllers/admin/account.controller.js';

const router = express.Router();

router.get('/profile', asyncHandler(controller.getProfile));

export default router;