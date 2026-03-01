import * as categoryModel from '../models/category.model.js';

// middleware loads category lists into res.locals for client-side views
export default async function categoryLoader(req, res, next) {
  const plist = await categoryModel.findLevel1Categories();
  const clist = await categoryModel.findLevel2Categories();
  res.locals.lcCategories1 = plist;
  res.locals.lcCategories2 = clist;
  next();
}
