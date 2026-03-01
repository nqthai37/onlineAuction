import express from 'express';
import asyncHandler from '../../middlewares/asyncHandler.js';
import controller from '../../controllers/admin/user.controller.js';

const router = express.Router();

router.get('/list', asyncHandler(controller.list));
router.get('/detail/:id', asyncHandler(controller.detail));
router.get('/add', asyncHandler(controller.addPage));
router.post('/add', asyncHandler(controller.postAdd));
router.get('/edit/:id', asyncHandler(controller.editPage));
router.post('/edit', asyncHandler(controller.postEdit));
router.post('/reset-password', asyncHandler(controller.resetPassword));
router.post('/delete', asyncHandler(controller.deleteUser));
router.get('/upgrade-requests', asyncHandler(controller.upgradeRequests));
router.post('/upgrade/approve', asyncHandler(controller.approveUpgrade));
router.post('/upgrade/reject', asyncHandler(controller.rejectUpgrade));

export default router;