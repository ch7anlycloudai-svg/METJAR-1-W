/**
 * Build a slug from a string.
 * Handles Arabic and French characters.
 */
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\u0600-\u06FF-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

/**
 * Paginate a Supabase query builder.
 * Returns { from, to } range indices.
 */
function paginate(page = 1, limit = 20) {
  const p = Math.max(1, parseInt(page, 10) || 1);
  const l = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
  const from = (p - 1) * l;
  const to = from + l - 1;
  return { from, to, page: p, limit: l };
}

/**
 * Standard success response.
 */
function successResponse(res, data, statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    ...data,
  });
}

/**
 * Standard error response.
 */
function errorResponse(res, message, statusCode = 500) {
  return res.status(statusCode).json({
    success: false,
    error: message,
  });
}

module.exports = {
  slugify,
  paginate,
  successResponse,
  errorResponse,
};
