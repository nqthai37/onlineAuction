import * as productModel from '../models/product.model.js';
import * as reviewModel from '../models/review.model.js';
import express from 'express';
import asyncHandler from '../middlewares/asyncHandler.js';
import controller from '../controllers/seller.controller.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

router.get('/', async function (req, res) {
    const sellerId = req.session.authUser.id;
    const stats = await productModel.getSellerStats(sellerId);
    res.render('vwSeller/dashboard', { stats });
});

// All Products - View only
router.get('/products', async function (req, res) {
    const sellerId = req.session.authUser.id;
    const products = await productModel.findAllProductsBySellerId(sellerId);
    res.render('vwSeller/all-products', { products });
});

// Active Products - CRUD
router.get('/products/active', async function (req, res) {
    const sellerId = req.session.authUser.id;
    const products = await productModel.findActiveProductsBySellerId(sellerId);
    res.render('vwSeller/active', { products });
});

// Pending Products - Waiting for payment
router.get('/products/pending', async function (req, res) {
    const sellerId = req.session.authUser.id;
    const [products, stats] = await Promise.all([
        productModel.findPendingProductsBySellerId(sellerId),
        productModel.getPendingProductsStats(sellerId)
    ]);
    
    // Lấy message từ query param
    let success_message = '';
    if (req.query.message === 'cancelled') {
        success_message = 'Auction cancelled successfully!';
    }
    
    res.render('vwSeller/pending', { products, stats, success_message });
});

// Sold Products - Paid successfully
router.get('/products/sold', async function (req, res) {
    const sellerId = req.session.authUser.id;
    const [products, stats] = await Promise.all([
        productModel.findSoldProductsBySellerId(sellerId),
        productModel.getSoldProductsStats(sellerId)
    ]);
    
    // Fetch review info for each product
    const productsWithReview = await Promise.all(products.map(async (product) => {
        const review = await reviewModel.getProductReview(sellerId, product.highest_bidder_id, product.id);
        
        // Only show review if rating is not 0 (actual rating, not skip)
        const hasActualReview = review && review.rating !== 0;
        
        return {
            ...product,
            hasReview: hasActualReview,
            reviewRating: hasActualReview ? (review.rating === 1 ? 'positive' : 'negative') : null,
            reviewComment: hasActualReview ? review.comment : ''
        };
    }));
    
    res.render('vwSeller/sold-products', { products: productsWithReview, stats });
});

// Expired Products - No bidder or cancelled
router.get('/products/expired', async function (req, res) {
    const sellerId = req.session.authUser.id;
    const products = await productModel.findExpiredProductsBySellerId(sellerId);
    
    // Add review info for cancelled products with bidders
    for (let product of products) {
        if (product.status === 'Cancelled' && product.highest_bidder_id) {
            const review = await reviewModel.getProductReview(sellerId, product.highest_bidder_id, product.id);
            // Only show review if rating is not 0 (actual rating, not skip)
            const hasActualReview = review && review.rating !== 0;
            
            product.hasReview = hasActualReview;
            if (hasActualReview) {
                product.reviewRating = review.rating === 1 ? 'positive' : 'negative';
                product.reviewComment = review.comment;
            }
        }
    }
    
    res.render('vwSeller/expired', { products });
});

router.get('/products/add', async function (req, res) {
    const success_message = req.session.success_message;
    delete req.session.success_message; // Xóa message sau khi hiển thị
    res.render('vwSeller/add', { success_message });
});

router.post('/products/add', async function (req, res) {
    const product = req.body;
    // console.log('product:', product);
    const sellerId = req.session.authUser.id;
    // console.log('sellerId:', sellerId);
    
    // Parse UTC ISO strings from client
    const createdAtUTC = new Date(product.created_at);
    const endAtUTC = new Date(product.end_date);
    
    const productData = {
        seller_id: sellerId,
        category_id: product.category_id,
        name: product.name,
        starting_price: product.start_price.replace(/,/g, ''),
        step_price: product.step_price.replace(/,/g, ''),
        buy_now_price: product.buy_now_price !== '' ? product.buy_now_price.replace(/,/g, '') : null,
        created_at: createdAtUTC,
        end_at: endAtUTC,
        auto_extend: product.auto_extend === '1' ? true : false,
        thumbnail: null,  // to be updated after upload
        description: product.description,
        highest_bidder_id: null,
        current_price: product.start_price.replace(/,/g, ''),
        is_sold: null,
        allow_unrated_bidder: product.allow_new_bidders === '1' ? true : false,
        closed_at: null
    }
    console.log('productData:', productData);
    const returnedID = await productModel.addProduct(productData);

    const dirPath = path.join('public', 'images', 'products').replace(/\\/g, "/");

    const imgs = JSON.parse(product.imgs_list);

    // Move and rename thumbnail
    const mainPath = path.join(dirPath, `p${returnedID[0].id}_thumb.jpg`).replace(/\\/g, "/");
    const oldMainPath = path.join('public', 'uploads', path.basename(product.thumbnail)).replace(/\\/g, "/");
    const savedMainPath = '/' + path.join('images', 'products', `p${returnedID[0].id}_thumb.jpg`).replace(/\\/g, "/");
    fs.renameSync(oldMainPath, mainPath);
    await productModel.updateProductThumbnail(returnedID[0].id, savedMainPath);

    // Move and rename subimages 
    let i = 1;
    let newImgPaths = [];
    for (const imgPath of imgs) {
        const oldPath = path.join('public', 'uploads', path.basename(imgPath)).replace(/\\/g, "/");
        const newPath = path.join(dirPath, `p${returnedID[0].id}_${i}.jpg`).replace(/\\/g, "/");
        const savedPath = '/' + path.join('images', 'products', `p${returnedID[0].id}_${i}.jpg`).replace(/\\/g, "/");
        fs.renameSync(oldPath, newPath);
        newImgPaths.push({
            product_id: returnedID[0].id,
            img_link: savedPath
        });
        i++;
    }

    console.log('subimagesData:', newImgPaths);
    await productModel.addProductImages(newImgPaths);
    
    // Lưu success message vào session
    req.session.success_message = 'Product added successfully!';
    res.redirect('/seller/products/add');
});

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

router.post('/products/upload-thumbnail', upload.single('thumbnail'), async function (req, res) {
    res.json({
        success: true,
        file: req.file
    });
});

router.post('/products/upload-subimages', upload.array('images', 10), async function (req, res) {
    res.json({
        success: true,
        files: req.files
    });
});

// Cancel Product
router.post('/products/:id/cancel', async function (req, res) {
    try {
        const productId = req.params.id;
        const sellerId = req.session.authUser.id;
        const { reason, highest_bidder_id } = req.body;
        
        // Cancel product
        const product = await productModel.cancelProduct(productId, sellerId);
        
        // Create review if there's a bidder
        if (highest_bidder_id) {
            const reviewModule = await import('../models/review.model.js');
            const reviewData = {
                reviewer_id: sellerId,
                reviewee_id: highest_bidder_id,
                product_id: productId,
                rating: -1,
                comment: reason || 'Auction cancelled by seller'
            };
            const router = express.Router();

            router.get('/', asyncHandler(controller.dashboard));
            router.get('/products', asyncHandler(controller.allProducts));
            router.get('/products/active', asyncHandler(controller.activeProducts));
            router.get('/products/pending', asyncHandler(controller.pendingProducts));
            router.get('/products/sold', asyncHandler(controller.soldProducts));
            router.get('/products/expired', asyncHandler(controller.expiredProducts));
            router.get('/products/add', asyncHandler(controller.getAdd));
            router.post('/products/add', asyncHandler(controller.postAdd));

            const storage = multer.diskStorage({
                destination: function (req, file, cb) { cb(null, 'public/uploads/'); },
                filename: function (req, file, cb) { const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9); cb(null, uniqueSuffix + '-' + file.originalname); }
            });
            const upload = multer({ storage: storage });

            router.post('/products/upload-thumbnail', upload.single('thumbnail'), asyncHandler(controller.uploadThumbnail));
            router.post('/products/upload-subimages', upload.array('images', 10), asyncHandler(controller.uploadSubimages));

            router.post('/products/:id/cancel', asyncHandler(controller.cancelProduct));
            router.post('/products/:id/rate', asyncHandler(controller.rateBidder));
            router.put('/products/:id/rate', asyncHandler(controller.updateRate));
            router.post('/products/:id/append-description', asyncHandler(controller.appendDescription));
            router.get('/products/:id/description-updates', asyncHandler(controller.getDescriptionUpdates));
            router.put('/products/description-updates/:updateId', asyncHandler(controller.updateDescription));
            router.delete('/products/description-updates/:updateId', asyncHandler(controller.deleteDescription));
        }
    } catch (error) {
        console.error('Error cancelling product:', error);
        return res.status(500).json({ success: false, message: 'Failed to cancel product' });
    }
});

export default router;