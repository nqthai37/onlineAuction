import * as categoryModel from '../models/category.model.js';

/**
 * Service layer for category-related operations.
 * Helps abstract direct model calls and centralize business logic.
 */

export function getLevel1Categories() {
  return categoryModel.findLevel1Categories();
}

export function getLevel2Categories() {
  return categoryModel.findLevel2Categories();
}

export function getAllCategories() {
  return categoryModel.findAll();
}

export function getCategoryById(id) {
  return categoryModel.findByCategoryId(id);
}

export function createCategory(category) {
  return categoryModel.createCategory(category);
}

export function updateCategory(id, category) {
  return categoryModel.updateCategory(id, category);
}

export function deleteCategory(id) {
  return categoryModel.deleteCategory(id);
}

// other wrappers as needed
export function isCategoryHasProducts(id) {
  return categoryModel.isCategoryHasProducts(id);
}

export function findChildCategoryIds(parentCategoryId) {
  return categoryModel.findChildCategoryIds(parentCategoryId);
}
