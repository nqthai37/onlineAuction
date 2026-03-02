/**
 * Middleware: Cấu hình danh mục (Categories)
 * 
 * Chức năng:
 * - Tải danh mục Level 1 (danh mục cha)
 * - Tải danh mục Level 2 (danh mục con)
 * - Đưa vào res.locals để dùng trong views
 */

import { getLevel1Categories, getLevel2Categories } from '../services/category.service.js';

export const categoriesMiddleware = async (req, res, next) => {
  try {
    const plist = await getLevel1Categories();
    const clist = await getLevel2Categories();

    res.locals.lcCategories1 = plist;
    res.locals.lcCategories2 = clist;
  } catch (error) {
    console.error('Error loading categories:', error);
    res.locals.lcCategories1 = [];
    res.locals.lcCategories2 = [];
  }

  next();
};
