import express from 'express';
import passport from '../utils/passport.js';
import asyncHandler from '../middlewares/asyncHandler.js';
import controller from '../controllers/account.controller.js';
import { isAuthenticated } from '../middlewares/auth.mdw.js';

const router = express.Router();

// Account routes: routing only, controller contains business logic
router.get('/ratings', isAuthenticated, asyncHandler(controller.getRatings));
// GET /signup
router.get('/signup', controller.getSignupPage);


// GET /signin
router.get('/signin', controller.getSigninPage);

// GET /verify-email?email=...
router.get('/verify-email', controller.getVerifyEmailPage);

router.get('/forgot-password', controller.getForgotPasswordPage);
router.post('/forgot-password', asyncHandler(controller.postForgotPassword));
router.post('/verify-forgot-password-otp', asyncHandler(controller.postVerifyForgotPasswordOtp));
router.post('/resend-forgot-password-otp', asyncHandler(controller.postResendForgotPasswordOtp));
router.post('/reset-password', asyncHandler(controller.postResetPassword));
router.post('/signin', asyncHandler(controller.postSignin));

router.post('/signup', asyncHandler(controller.postSignup));

// POST /verify-email
router.post('/verify-email', asyncHandler(controller.postVerifyEmail));

// POST /resend-otp
router.post('/resend-otp', asyncHandler(controller.postResendOtp));

// GET /profile - HIỂN THỊ PROFILE & THÔNG BÁO
router.get('/profile', isAuthenticated, asyncHandler(controller.getProfile));

// PUT /profile - XỬ LÝ UPDATE
router.put('/profile', isAuthenticated, asyncHandler(controller.putProfile));
router.post('/logout', isAuthenticated, controller.postLogout);
router.get('/request-upgrade', isAuthenticated, asyncHandler(controller.getRequestUpgrade));
router.post('/request-upgrade', isAuthenticated, asyncHandler(controller.postRequestUpgrade));
router.get('/watchlist', isAuthenticated, asyncHandler(controller.getWatchlist));

// Bidding Products - Sản phẩm đang tham gia đấu giá
router.get('/bidding', isAuthenticated, asyncHandler(controller.getBidding));

// Won Auctions - Sản phẩm đã thắng (pending, sold, cancelled)
router.get('/auctions', isAuthenticated, asyncHandler(controller.getAuctions));

// Rate Seller - POST
router.post('/won-auctions/:productId/rate-seller', isAuthenticated, asyncHandler(controller.postRateSeller));

// Rate Seller - PUT (Edit)
router.put('/won-auctions/:productId/rate-seller', isAuthenticated, asyncHandler(controller.putRateSeller));

router.get('/seller/products', isAuthenticated, controller.getSellerProducts);
router.get('/seller/sold-products', isAuthenticated, controller.getSellerSoldProducts);

// ===================== OAUTH ROUTES =====================

// Google OAuth
router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/account/signin' }), (req, res) => {
  req.session.authUser = req.user;
  req.session.isAuthenticated = true;
  res.redirect('/');
});

// Facebook OAuth
// NOTE: 'email' scope chỉ hoạt động với Admin/Developer/Tester trong Development Mode
// Tạm thời chỉ dùng 'public_profile' để test, sau đó thêm 'email' khi đã add tester
router.get('/auth/facebook', passport.authenticate('facebook', { scope: ['public_profile'] }));
router.get('/auth/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/account/signin' }), (req, res) => {
  req.session.authUser = req.user;
  req.session.isAuthenticated = true;
  res.redirect('/');
});

// Twitter OAuth - DISABLED (Twitter API requires $100/month subscription)
// router.get('/auth/twitter',
//   passport.authenticate('twitter')
// );

// router.get('/auth/twitter/callback',
//   passport.authenticate('twitter', { failureRedirect: '/account/signin' }),
//   (req, res) => {
//     req.session.authUser = req.user;
//     req.session.isAuthenticated = true;
//     res.redirect('/');
//   }
// );

// GitHub OAuth
router.get('/auth/github', passport.authenticate('github', { scope: ['user:email'] }));
router.get('/auth/github/callback', passport.authenticate('github', { failureRedirect: '/account/signin' }), (req, res) => {
  req.session.authUser = req.user;
  req.session.isAuthenticated = true;
  res.redirect('/');
});

export default router;
