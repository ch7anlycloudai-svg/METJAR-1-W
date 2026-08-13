const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase');
const { successResponse, errorResponse } = require('../utils/helpers');

/**
 * Admin login with email and password.
 */
async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return errorResponse(res, 'Email and password are required.', 400);
    }

    const { data: admin, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .single();

    if (error || !admin) {
      return errorResponse(res, 'Invalid email or password.', 401);
    }

    const isValidPassword = await bcrypt.compare(password, admin.password_hash);
    if (!isValidPassword) {
      return errorResponse(res, 'Invalid email or password.', 401);
    }

    const token = jwt.sign(
      {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: 'admin',
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return successResponse(res, {
      token,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    return errorResponse(res, 'Server error during login.');
  }
}

/**
 * Get current admin profile from token.
 */
async function getProfile(req, res) {
  try {
    const { data: admin, error } = await supabase
      .from('admin_users')
      .select('id, email, name, created_at')
      .eq('id', req.admin.id)
      .single();

    if (error || !admin) {
      return errorResponse(res, 'Admin not found.', 404);
    }

    return successResponse(res, { admin });
  } catch (err) {
    console.error('Get profile error:', err);
    return errorResponse(res, 'Server error fetching profile.');
  }
}

/**
 * Change admin password.
 */
async function changePassword(req, res) {
  try {
    const { current_password, new_password } = req.body;

    if (!current_password || !new_password) {
      return errorResponse(res, 'Current password and new password are required.', 400);
    }

    if (new_password.length < 6) {
      return errorResponse(res, 'New password must be at least 6 characters.', 400);
    }

    const { data: admin, error: fetchError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('id', req.admin.id)
      .single();

    if (fetchError || !admin) {
      return errorResponse(res, 'Admin not found.', 404);
    }

    const isValidPassword = await bcrypt.compare(current_password, admin.password_hash);
    if (!isValidPassword) {
      return errorResponse(res, 'Current password is incorrect.', 400);
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(new_password, salt);

    const { error: updateError } = await supabase
      .from('admin_users')
      .update({ password_hash: hashedPassword })
      .eq('id', admin.id);

    if (updateError) {
      return errorResponse(res, 'Failed to update password.');
    }

    return successResponse(res, { message: 'Password updated successfully.' });
  } catch (err) {
    console.error('Change password error:', err);
    return errorResponse(res, 'Server error changing password.');
  }
}

module.exports = {
  login,
  getProfile,
  changePassword,
};
