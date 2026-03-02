import 'dotenv/config';
import express from 'express';
import { engine } from 'express-handlebars';
import session from 'express-session';
import methodOverride from 'method-override';
import path from 'path';
import { fileURLToPath } from 'url';
import passport from './utils/passport.js';

// Import Scheduled Jobs
import { startAuctionEndNotifier } from './scripts/auctionEndNotifier.js';

// Import Handlebars Helpers (tách riêng)
import { helpersFunctions } from './utils/handlebars-helpers.js';

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
import { userInfoMiddleware } from './middlewares/userInfo.mdw.js';
import { categoriesMiddleware } from './middlewares/categories.mdw.js';

// Import Upload Config (tách riêng)
import { ensureUploadDirExists } from './config/uploadConfig.js';

// Import Services
import { getAllCategories } from './services/category.service.js';

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
  helpers: helpersFunctions,
  partialsDir: [
    path.join(__dirname, 'views/partials'),
    path.join(__dirname, 'views/vwAccount'),
  ],
}));
app.set('view engine', 'handlebars');
app.set('views', './views');

// Khởi tạo thư mục uploads
ensureUploadDirExists();

// ============================================================
// 3. MIDDLEWARE TOÀN CỤC (Chạy cho mọi request)
// ============================================================

// 3.1. Middleware User Info (tách riêng vào userInfo.mdw.js)
app.use(userInfoMiddleware);

// 3.2. Middleware Category (tách riêng vào categories.mdw.js)
app.use(categoriesMiddleware);

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
    const categories = await getAllCategories();
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