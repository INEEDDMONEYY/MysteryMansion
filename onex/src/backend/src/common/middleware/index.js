// Common middleware index
export { authMiddleware, adminOnlyMiddleware } from './authMiddleware.js';
export { default as isAdmin } from './isAdmin.js';
export { enforceRestriction } from './restrictionMiddleware.js';
