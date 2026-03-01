import * as categoryModel from '../../models/category.model.js';

export async function list(req, res) {
  const categories = await categoryModel.findAll();
  const success_message = req.session.success_message;
  const error_message = req.session.error_message;
  delete req.session.success_message;
  delete req.session.error_message;
  return res.render('vwAdmin/category/list', {
    categories,
    empty: categories.length === 0,
    success_message,
    error_message
  });
}

export async function detail(req, res) {
  const id = req.params.id;
  const category = await categoryModel.findByCategoryId(id);
  return res.render('vwAdmin/category/detail', { category });
}

export async function getAdd(req, res) {
  const parentCategories = await categoryModel.findLevel1Categories();
  return res.render('vwAdmin/category/add', { parentCategories });
}

export async function getEdit(req, res) {
  const id = req.params.id;
  const category = await categoryModel.findByCategoryId(id);
  const parentCategories = await categoryModel.findLevel1Categories();
  return res.render('vwAdmin/category/edit', { category, parentCategories });
}

export async function postAdd(req, res) {
  const { name, parent_id } = req.body;
  await categoryModel.createCategory({ name, parent_id: parent_id || null });
  req.session.success_message = 'Category added successfully!';
  return res.redirect('/admin/categories/list');
}

export async function postEdit(req, res) {
  const { id, name, parent_id } = req.body;
  await categoryModel.updateCategory(id, { name, parent_id: parent_id || null });
  req.session.success_message = 'Category updated successfully!';
  return res.redirect('/admin/categories/list');
}

export async function postDelete(req, res) {
  const { id } = req.body;
  const hasProducts = await categoryModel.isCategoryHasProducts(id);
  if (hasProducts) {
    req.session.error_message = 'Cannot delete category that has associated products.';
    return res.redirect('/admin/categories/list');
  }
  await categoryModel.deleteCategory(id);
  req.session.success_message = 'Category deleted successfully!';
  return res.redirect('/admin/categories/list');
}

export default {
  list,
  detail,
  getAdd,
  getEdit,
  postAdd,
  postEdit,
  postDelete
};
