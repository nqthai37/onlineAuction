import express from 'express';
import asyncHandler from '../middlewares/asyncHandler.js';
import controller from '../controllers/home.controller.js';

const router = express.Router();

router.get('/', asyncHandler(controller.getHome));

export default router;