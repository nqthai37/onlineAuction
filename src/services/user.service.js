import * as userModel from '../models/user.model.js';

/**
 * Service layer for user-related operations.
 * Middleware or controllers should call these functions instead of directly
 * invoking the model. This allows us to swap DB implementations, add caching,
 * or perform additional business logic in one place.
 */

/**
 * Truy xuất user theo id.
 * @param {number|string} id
 * @returns {Promise<Object|null>}
 */
export function getUserById(id) {
  return userModel.findById(id);
}

// Additional helpers as needed by other parts of the app.
export function findByUsername(username) {
  return userModel.findByUserName(username);
}

export function updateUser(id, userData) {
  return userModel.update(id, userData);
}

export function createUser(user) {
  return userModel.add(user);
}

export function deleteUser(id) {
  return userModel.deleteUser(id);
}
