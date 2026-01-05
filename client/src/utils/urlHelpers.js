/**
 * ========================================
 * URL & SLUG UTILITIES
 * ========================================
 */

/**
 * Generate URL-safe slug from string
 * @param {string} text - Text to convert to slug
 * @returns {string} URL-safe slug
 */
export const generateSlug = (text) => {
  if (!text) return "";

  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
};

/**
 * Build query string from object
 * @param {Object} params - Query parameters
 * @returns {string} Query string
 */
export const buildQueryString = (params) => {
  const filtered = Object.entries(params).filter(
    ([_, value]) => value !== null && value !== undefined && value !== ""
  );

  if (filtered.length === 0) return "";

  const searchParams = new URLSearchParams(filtered);
  return `?${searchParams.toString()}`;
};
