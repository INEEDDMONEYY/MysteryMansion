import jwt from "jsonwebtoken";
import User from "../../models/User.js";
import env from "../../config/env.js"; // central env file for JWT_SECRET

/* ---------------------------------------------------------
   🔐 AUTH MIDDLEWARE
   Verifies JWT from header or cookie and attaches user to req
--------------------------------------------------------- */
const authMiddleware = async (req, res, next) => {
  // Allow all OPTIONS requests through for CORS preflight
  if (req.method === 'OPTIONS') {
    return next();
  }
  try {
    console.log("\n[AuthMiddleware] ---------------- NEW REQUEST ----------------");
    console.log("[AuthMiddleware] Headers:", req.headers);
    console.log("[AuthMiddleware] Cookies:", req.cookies);

    // Extract token from Authorization header or cookies
    const token =
      req.header("Authorization")?.replace("Bearer ", "") ||
      req.cookies?.token;

    console.log("[AuthMiddleware] Extracted token:", token);

    if (!token) {
      console.warn("[AuthMiddleware] No token provided");
      return res.status(401).json({ error: "No token provided" });
    }

    // Verify JWT
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || env.JWT_SECRET);
      console.log("[AuthMiddleware] Decoded JWT payload:", decoded);
    } catch (verifyErr) {
      console.error("[AuthMiddleware] Token verification failed:", verifyErr.message);
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    // Ensure token contains user ID
    const userId = decoded.id || decoded._id;
    if (!userId) {
      console.error("[AuthMiddleware] Token payload missing id/_id");
      return res.status(401).json({ error: "Invalid token payload - missing id/_id" });
    }

    console.log("[AuthMiddleware] User ID from token:", userId);

    // Fetch user from DB and attach to req
    const user = await User.findById(userId).select("-password");
    console.log("[AuthMiddleware] User found in DB:", user ? user._id : "null");

    if (!user) {
      console.error("[AuthMiddleware] No user found for ID:", userId);
      return res.status(401).json({ error: "User not found" });
    }

    req.user = user; // attach user to request
    console.log("[AuthMiddleware] Attached user to req.user:", req.user._id);

    next();
  } catch (err) {
    console.error("[AuthMiddleware] Unexpected error:", err);
    return res.status(500).json({
      error: "Server error in auth middleware",
      details: err.message,
    });
  }
};

/* ---------------------------------------------------------
   🛡️ ADMIN-ONLY MIDDLEWARE
   Use after authMiddleware to restrict access to admins
--------------------------------------------------------- */
const adminOnlyMiddleware = (req, res, next) => {
  console.log("[AdminMiddleware] Checking admin access…");

  if (!req.user) {
    console.error("[AdminMiddleware] No req.user found — auth missing");
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.user.role !== "admin") {
    console.warn(
      `[AdminMiddleware] Access denied. User ${req.user.username} is NOT an admin.`
    );
    return res.status(403).json({ error: "Admins only" });
  }

  console.log(`[AdminMiddleware] Access granted. Admin: ${req.user.username}`);
  next();
};

/* ---------------------------------------------------------
   🔓 OPTIONAL AUTH MIDDLEWARE
   Attaches req.user if a valid token is present, but does
   not reject requests that have no token.
--------------------------------------------------------- */
const optionalAuthMiddleware = async (req, res, next) => {
  try {
    const token =
      req.header("Authorization")?.replace("Bearer ", "") ||
      req.cookies?.token;

    if (!token) return next();

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || env.JWT_SECRET);
    } catch {
      return next(); // bad token — just proceed unauthenticated
    }

    const userId = decoded.id || decoded._id;
    if (userId) {
      const user = await User.findById(userId).select("-password");
      if (user) req.user = user;
    }
  } catch {
    // silently skip
  }
  return next();
};

/* ---------------------------------------------------------
   EXPORT MIDDLEWARES
--------------------------------------------------------- */
export { authMiddleware, adminOnlyMiddleware, optionalAuthMiddleware };
