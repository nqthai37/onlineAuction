import express from 'express';
import asyncHandler from '../middlewares/asyncHandler.js';
import controller from '../controllers/product.controller.js';
import { isAuthenticated } from '../middlewares/auth.mdw.js';
import multer from 'multer';
import path from 'path';

const router = express.Router();

// Multer for file uploads (payment/shipping proofs)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'public/uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + Math.round(Math.random() * 1e9) + '-' + file.originalname)
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext && mime) return cb(null, true);
    cb(new Error('Only image files are allowed'));
  }
});

// Public product routes
router.get('/category', asyncHandler(controller.getByCategory));
router.get('/search', asyncHandler(controller.search));
router.get('/detail', asyncHandler(controller.getDetail));
router.get('/bidding-history', asyncHandler(controller.getBiddingHistoryPage));

// Watchlist
router.post('/watchlist', isAuthenticated, asyncHandler(controller.postAddToWatchlist));
router.delete('/watchlist', isAuthenticated, asyncHandler(controller.deleteFromWatchlist));

// Bidding & comments
router.post('/bid', isAuthenticated, asyncHandler(controller.postBid));
router.post('/comment', isAuthenticated, asyncHandler(controller.postComment));

// Bid history (JSON)
router.get('/bid-history/:productId', asyncHandler(controller.getBidHistoryJson));

// Complete order page
router.get('/complete-order', isAuthenticated, asyncHandler(controller.getCompleteOrder));

// Image upload for orders
router.post('/order/upload-images', isAuthenticated, upload.array('images', 5), asyncHandler(controller.postUploadImages));

// Order payment & shipping routes
router.post('/order/:orderId/submit-payment', isAuthenticated, asyncHandler(controller.postSubmitPayment));
router.post('/order/:orderId/confirm-payment', isAuthenticated, asyncHandler(controller.postConfirmPayment));
router.post('/order/:orderId/submit-shipping', isAuthenticated, asyncHandler(controller.postSubmitShipping));
router.post('/order/:orderId/confirm-delivery', isAuthenticated, asyncHandler(controller.postConfirmDelivery));
router.post('/order/:orderId/submit-rating', isAuthenticated, asyncHandler(controller.postSubmitRating));
router.post('/order/:orderId/complete-transaction', isAuthenticated, asyncHandler(controller.postCompleteTransaction));
router.post('/order/:orderId/send-message', isAuthenticated, asyncHandler(controller.postSendMessage));
router.get('/order/:orderId/messages', isAuthenticated, asyncHandler(controller.getMessages));

// Reject / Unreject bidders, Buy Now and ratings
router.post('/reject-bidder', isAuthenticated, asyncHandler(controller.postRejectBidder));
router.post('/unreject-bidder', isAuthenticated, asyncHandler(controller.postUnrejectBidder));
router.post('/buy-now', isAuthenticated, asyncHandler(controller.postBuyNow));

// Ratings pages
router.get('/seller/:sellerId/ratings', asyncHandler(controller.getSellerRatings));
router.get('/bidder/:bidderId/ratings', asyncHandler(controller.getBidderRatings));

export default router;