import 'dotenv/config';
import express from 'express';
import { engine } from 'express-handlebars';
import expressHandlebarsSections from 'express-handlebars-sections';
import session from 'express-session';
import methodOverride from 'method-override';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import passport from './utils/passport.js';

// Import Scheduled Jobs
import { startAuctionEndNotifier } from './scripts/auctionEndNotifier.js';

// Import Routes
import homeRouter from './routes/home.route.js';
import productRouter from './routes/product.route.js';
import accountRouter from './routes/account.route.js';
import adminCategoryRouter from './routes/admin/category.route.js';
import adminUserRouter from './routes/admin/user.route.js';
import adminAccountRouter from './routes/admin/account.route.js';
import adminProductRouter from './routes/admin/product.route.js';
import adminSystemRouter from './routes/admin/system.route.js';
import sellerRouter from './routes/seller.route.js';
// Import Middlewares
import { isAuthenticated, isSeller, isAdmin } from './middlewares/auth.mdw.js';
import * as categoryModel from './models/category.model.js';
// userModel is no longer needed directly in this file; user session
// middleware imports it itself when necessary.

// helpers, middleware and config have been split into their own modules
import viewHelpers from './config/viewHelpers.js';
import userSession from './middlewares/userSession.mdw.js';
import categoryLoader from './middlewares/categoryLoader.mdw.js';
import { uploadDir, fileFilter } from './config/uploadConfig.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3005;

// ============================================================
// 1. CẤU HÌNH CỐT LÕI
// ============================================================
app.use('/static', express.static('public'));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.json({ limit: '50mb' }));
app.use(methodOverride('_method'));
app.use(session({
  secret: 'x8w3v9p2q1r7s6t5u4z0a8b7c6d5e4f3g2h1j9k8l7m6n5o4p3q2r1s0t9u8v7w6x5y4z3',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // false chạy localhost
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// ============================================================
// 2. CẤU HÌNH VIEW ENGINE (Handlebars)
// ============================================================
app.engine('handlebars', engine({
  defaultLayout: 'main',
  helpers: {
    section: expressHandlebarsSections(),
    // spread in helpers defined in separate file to keep index.js small
    ...viewHelpers
  },
  partialsDir: [
        path.join(__dirname, 'views/partials'), 
        path.join(__dirname, 'views/vwAccount') 
  ]
}));
app.set('view engine', 'handlebars');
app.set('views', './views');

// uploadDir and fileFilter are defined in config/uploadConfig.js

// ============================================================
// 3. MIDDLEWARE TOÀN CỤC (Chạy cho mọi request)
// ============================================================

// 3.1. Middleware User Info (moved to middlewares/userSession.mdw.js)
app.use(userSession);

// 3.2. Middleware Category (Chỉ load cho Client) - moved to middlewares/categoryLoader.mdw.js
app.use(categoryLoader);

// ============================================================
// 4. CẤU HÌNH LOGIC ADMIN (Design Pattern)
// ============================================================

// A. Bảo mật trước tiên: Mọi route /admin/* phải qua cửa kiểm soát

app.use('/admin', isAdmin);

// B. Thiết lập giao diện Admin (Bật cờ để Layout biết đường hiển thị Sidebar)
app.use('/admin', function (req, res, next) {
    res.locals.isAdminMode = true; 
    next();
});

// // C. Redirect thông minh cho trang chủ '/'
// // Nếu là Admin mà vào trang chủ '/', tự động chuyển về Dashboard (/admin)
// // Trừ khi họ bấm nút "View Website" (có tham số ?mode=client)
// app.use('/', function(req, res, next) {
//     if (req.path === '/' && res.locals.isAdmin && req.query.mode !== 'client') {
//         return res.redirect('/admin');
//     }
//     next();
// });


// ============================================================
// 5. ROUTES
// ============================================================

// Các Route Admin
app.use('/admin/account', adminAccountRouter);
app.use('/admin/users', adminUserRouter);
app.use('/admin/categories', adminCategoryRouter);
app.use('/admin/products', adminProductRouter);
app.use('/admin/system', adminSystemRouter);
// Các Route Seller
app.use('/seller', isAuthenticated, isSeller, sellerRouter);

// API endpoint for categories (for search modal)
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await categoryModel.findAll();
    // Add level information based on parent_id
    const categoriesWithLevel = categories.map(cat => ({
      ...cat,
      level: cat.parent_id ? 2 : 1
    }));
    res.json({ categories: categoriesWithLevel });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to load categories' });
  }
});

// Các Route Client (Đặt cuối cùng để tránh override)
app.use('/', homeRouter);
app.use('/products', productRouter);
app.use('/account', accountRouter);

app.listen(PORT, function () {
  console.log(`Server is running on http://localhost:${PORT}`);
  
  // Start scheduled jobs
  startAuctionEndNotifier(30); // Check every 30 seconds for ended auctions
});