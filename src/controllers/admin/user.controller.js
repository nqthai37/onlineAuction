import bcrypt from 'bcryptjs';
import * as upgradeRequestModel from '../../models/upgradeRequest.model.js';
import * as userModel from '../../models/user.model.js';
import { sendMail } from '../../utils/mailer.js';

export async function list(req, res) {
  const users = await userModel.loadAllUsers();
  const success_message = req.session.success_message;
  const error_message = req.session.error_message;
  delete req.session.success_message;
  delete req.session.error_message;
  return res.render('vwAdmin/users/list', { users, empty: users.length === 0, success_message, error_message });
}

export async function detail(req, res) {
  const id = req.params.id;
  const user = await userModel.findById(id);
  return res.render('vwAdmin/users/detail', { user });
}

export async function addPage(req, res) {
  return res.render('vwAdmin/users/add');
}

export async function postAdd(req, res) {
  try {
    const { fullname, email, address, date_of_birth, role, email_verified, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = { fullname, email, address, date_of_birth: date_of_birth || null, role, email_verified: email_verified === 'true', password_hash: hashedPassword, created_at: new Date(), updated_at: new Date() };
    await userModel.add(newUser);
    req.session.success_message = 'User added successfully!';
    return res.redirect('/admin/users/list');
  } catch (error) {
    console.error('Add user error:', error);
    req.session.error_message = 'Failed to add user. Please try again.';
    return res.redirect('/admin/users/add');
  }
}

export async function editPage(req, res) {
  const id = req.params.id;
  const user = await userModel.findById(id);
  const error_message = req.session.error_message;
  delete req.session.error_message;
  return res.render('vwAdmin/users/edit', { user, error_message });
}

export async function postEdit(req, res) {
  try {
    const { id, fullname, email, address, date_of_birth, role, email_verified } = req.body;
    const updateData = { fullname, email, address, date_of_birth: date_of_birth || null, role, email_verified: email_verified === 'true', updated_at: new Date() };
    await userModel.update(id, updateData);
    req.session.success_message = 'User updated successfully!';
    return res.redirect('/admin/users/list');
  } catch (error) {
    console.error('Update user error:', error);
    req.session.error_message = 'Failed to update user. Please try again.';
    return res.redirect(`/admin/users/edit/${req.body.id}`);
  }
}

export async function resetPassword(req, res) {
  try {
    const { id } = req.body;
    const defaultPassword = '123';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);
    const user = await userModel.findById(id);
    await userModel.update(id, { password_hash: hashedPassword, updated_at: new Date() });
    if (user && user.email) {
      try {
        await sendMail({ to: user.email, subject: 'Your Password Has Been Reset - Online Auction', html: `...` });
        console.log(`Password reset email sent to ${user.email}`);
      } catch (emailError) {
        console.error('Failed to send password reset email:', emailError);
      }
    }
    req.session.success_message = `Password of ${user.fullname} reset successfully to default: 123`;
    return res.redirect(`/admin/users/list`);
  } catch (error) {
    console.error('Reset password error:', error);
    req.session.error_message = 'Failed to reset password. Please try again.';
    return res.redirect(`/admin/users/list`);
  }
}

export async function deleteUser(req, res) {
  try {
    const { id } = req.body;
    await userModel.deleteUser(id);
    req.session.success_message = 'User deleted successfully!';
    return res.redirect('/admin/users/list');
  } catch (error) {
    console.error('Delete user error:', error);
    req.session.error_message = 'Failed to delete user. Please try again.';
    return res.redirect('/admin/users/list');
  }
}

export async function upgradeRequests(req, res) {
  const requests = await upgradeRequestModel.loadAllUpgradeRequests();
  return res.render('vwAdmin/users/upgradeRequests', { requests });
}

export async function approveUpgrade(req, res) {
  const id = req.body.id;
  const bidderId = req.body.bidder_id;
  await upgradeRequestModel.approveUpgradeRequest(id);
  await userModel.updateUserRoleToSeller(bidderId);
  return res.redirect('/admin/users/upgrade-requests');
}

export async function rejectUpgrade(req, res) {
  const id = req.body.id;
  const admin_note = req.body.admin_note;
  await upgradeRequestModel.rejectUpgradeRequest(id, admin_note);
  return res.redirect('/admin/users/upgrade-requests');
}

export default {
  list,
  detail,
  addPage,
  postAdd,
  editPage,
  postEdit,
  resetPassword,
  deleteUser,
  upgradeRequests,
  approveUpgrade,
  rejectUpgrade
};
