// Auth Routes 
import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { OAuth2Client } from "google-auth-library";
import User from "../../models/User.js";
import Referral from "../../models/Referral.js";
import env from "../../config/env.js";
import sendWelcomeEmail from "../../common/utils/sendWelcomeEmail.js";
import sendResetEmail from "../../common/utils/sendResetEmail.js";
import { ensureUserAdminConversation } from "../../common/utils/ensureAdminWelcomeConversation.js";
import { createNotification } from "../notifications/notificationController.js";
import { awardCredits, dayKey } from "../credits/creditEarnService.js";
import { sendVerificationCode, confirmVerificationCode } from "./controllers/emailVerificationController.js";

// 🔐 NEW: import combined middleware
import { authMiddleware, adminOnlyMiddleware, touchLastActive } from "../../common/middleware/authMiddleware.js";

const router = express.Router();

/* ── Email verification (pre-signup) ── */
router.post('/email-verify/send',    sendVerificationCode);
router.post('/email-verify/confirm', confirmVerificationCode);

const escapeRegex = (value = "") => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const normalizeUsername = (value = "") =>
  value
    .replace(/[\u2018\u2019\u201A\u201B\u2032]/g, "'")
    .replace(/[\u201C\u201D\u201E\u201F\u2033]/g, '"')
    .replace(/\u00A0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
const looksLikeEmail = (value = "") => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).trim());
const strongPasswordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

/* -------------------------- 🔑 Signup -------------------------- */
router.post("/signup", async (req, res) => {
  try {
    const { username, email, password, accountType, emailVerificationToken, referralCode } = req.body;
    const normalizedUsername = normalizeUsername(username || "");
    const normalizedEmail = (email || "").trim().toLowerCase();

    if (!normalizedUsername || !normalizedEmail || !password) {
      return res.status(400).json({
        error: "Username, email, and password are required"
      });
    }

    // Require a valid emailVerificationToken issued by /email-verify/confirm
    if (!emailVerificationToken) {
      return res.status(400).json({ error: "Email verification is required before signing up." });
    }
    try {
      const payload = jwt.verify(emailVerificationToken, env.JWT_SECRET);
      if (payload.purpose !== 'email-verify' || payload.email !== normalizedEmail) {
        return res.status(400).json({ error: "Invalid or mismatched email verification token." });
      }
    } catch {
      return res.status(400).json({ error: "Email verification token is expired or invalid. Please verify your email again." });
    }

    if (looksLikeEmail(normalizedUsername)) {
      return res.status(400).json({ error: "Username cannot be an email address" });
    }

    if (!strongPasswordRegex.test(password)) {
      return res.status(400).json({
        error:
          "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.",
      });
    }

    const existingUser = await User.findOne({
      username: { $regex: `^${escapeRegex(normalizedUsername)}$`, $options: "i" },
    });
    if (existingUser) return res.status(409).json({ error: "Username already exists" });

    const existingEmail = await User.findOne({ email: normalizedEmail });
    if (existingEmail) return res.status(409).json({ error: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const resolvedAccountType = ["provider", "client"].includes(accountType) ? accountType : "provider";

    // Resolve the referral link (if any) before creating the account so the
    // new user can be linked to the inviting provider in one write.
    let referral = null;
    const normalizedReferralCode = String(referralCode || "").trim();
    if (normalizedReferralCode) {
      referral = await Referral.findOne({ code: normalizedReferralCode });
    }

    const user = new User({
      username: normalizedUsername,
      email: normalizedEmail,
      password: hashedPassword,
      role: "user",
      accountType: resolvedAccountType,
      referredBy: referral?.providerId || null,
      referralCodeUsed: referral ? normalizedReferralCode : "",
    });

    await user.save();

    if (referral) {
      referral.signupCount += 1;
      referral.save().catch(() => {});

      awardCredits({ userId: referral.providerId, eventKey: 'referral_signup', refId: String(user._id) });

      createNotification({
        audience: 'user',
        type: 'referral_signup',
        title: 'Your referral signed up! 🎉',
        message: `${normalizedUsername} just created an account using your referral link.`,
        userId: referral.providerId,
        meta: { referredUserId: user._id, username: normalizedUsername },
      }).catch(() => {});
    }

    if (user.role === "user") {
      await ensureUserAdminConversation(user._id);
    }

    // Send welcome email after successful signup. Do not fail signup if email service has issues.
    if (user.email) {
      sendWelcomeEmail({ to: user.email, username: user.username, accountType: user.accountType }).catch((mailErr) => {
        console.warn("Welcome email failed:", mailErr?.message || mailErr);
      });
    }

    // Fire admin notification for new signup (best-effort)
    createNotification({
      audience: 'admin',
      type: 'new_signup',
      title: 'New User Signed Up',
      message: `${normalizedUsername} just created an account.`,
      meta: { userId: user._id, username: normalizedUsername, email: normalizedEmail },
    }).catch(() => {});

    // Welcome notification for the new user
    createNotification({
      audience: 'user',
      type: 'welcome',
      title: 'Welcome to TopEscortNetwork! 🎉',
      message: `Hi ${normalizedUsername}, your account is ready. Explore listings, promote your profile, and connect with others.`,
      userId: user._id,
      meta: {},
    }).catch(() => {});

    res.status(201).json({ message: "User registered successfully", user });
  } catch (err) {
    console.error("Signup error:", err.message);
    res.status(500).json({ error: "Server error during signup" });
  }
});

/* ----------------- Shared sign-in response ----------------- */
const sendSignedInResponse = (res, user) => {
  const token = jwt.sign(
    { id: user._id, username: user.username, role: user.role },
    env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.cookie("token", token, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "none",
  });

  const signedInAt = new Date();
  User.updateOne({ _id: user._id }, { $set: { lastLogin: signedInAt, lastActiveAt: signedInAt } })
    .catch((err) => console.error("lastLogin update failed:", err.message));

  awardCredits({ userId: user._id, eventKey: 'daily_login', refId: dayKey() });

  return res.json({
    message: "Login successful",
    token,
    user: {
      _id: user._id,
      username: user.username,
      role: user.role,
      accountType: user.accountType,
      profilePic: user.profilePic,
      roleRestriction: user.roleRestriction,
      status: user.status,
    },
  });
};

/* -------------------------- 🔓 Signin -------------------------- */
router.post("/signin", async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = (email || "").trim().toLowerCase();

    if (!normalizedEmail || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

    return sendSignedInResponse(res, user);
  } catch (err) {
    console.error("Signin error:", err.message);
    res.status(500).json({ error: "Server error during signin" });
  }
});

/* ----------------------- 🔵 Google Sign-in ----------------------- */
const googleClient = new OAuth2Client();

router.post("/google", async (req, res) => {
  try {
    if (!env.GOOGLE_CLIENT_ID) {
      return res.status(503).json({ error: "Google sign-in is not available right now." });
    }
    const credential = String(req.body?.credential || "");
    if (!credential) return res.status(400).json({ error: "Missing Google credential." });

    let payload;
    try {
      const ticket = await googleClient.verifyIdToken({ idToken: credential, audience: env.GOOGLE_CLIENT_ID });
      payload = ticket.getPayload();
    } catch {
      return res.status(401).json({ error: "Google sign-in failed. Please try again." });
    }

    const email = String(payload?.email || "").trim().toLowerCase();
    if (!email || payload?.email_verified !== true) {
      return res.status(401).json({ error: "Your Google account email isn't verified." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      // Google already verified this address, so hand back the same short-lived
      // token the email-code step issues and let the user finish signing up.
      const emailVerificationToken = jwt.sign({ email, purpose: "email-verify" }, env.JWT_SECRET, { expiresIn: "15m" });
      return res.status(404).json({
        code: "GOOGLE_ACCOUNT_NOT_FOUND",
        error: "No TopEscortNetwork account uses this Google email yet.",
        email,
        emailVerificationToken,
      });
    }

    return sendSignedInResponse(res, user);
  } catch (err) {
    console.error("Google signin error:", err.message);
    res.status(500).json({ error: "Server error during Google sign-in" });
  }
});

/* -------------------------- 🚪 Logout -------------------------- */
router.post("/logout", (req, res) => {
  const token = req.cookies?.token || req.header("Authorization")?.replace("Bearer ", "");
  if (token) {
    try {
      const { id } = jwt.verify(token, env.JWT_SECRET);
      if (id) {
        User.updateOne({ _id: id }, { $set: { lastLogoutAt: new Date() } })
          .catch((err) => console.error("lastLogoutAt update failed:", err.message));
      }
    } catch {
      // Expired/invalid token — nothing to record.
    }
  }
  res.clearCookie("token", { httpOnly: true, sameSite: "none", secure: true });
  res.json({ message: "Logged out successfully" });
});

/* -------------------- ✅ Get Current User -------------------- */
router.get("/me", async (req, res) => {
  try {
    const token =
      req.cookies?.token || req.header("Authorization")?.replace("Bearer ", "");

    if (!token) return res.status(401).json({ error: "Unauthorized: No token provided" });

    const decoded = jwt.verify(token, env.JWT_SECRET);
    if (!decoded.id) return res.status(401).json({ error: "Invalid token payload" });

    const user = await User.findById(decoded.id).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });

    touchLastActive(user);
    res.json(user);
  } catch (err) {
    console.error("Fetch current user error:", err.message);
    res.status(403).json({ error: "Invalid or expired token" });
  }
});

/* -------------------------------------------------------------------
   🛑 NEW — Admin-Only Create User Route
   Accessible only to admin users.
-------------------------------------------------------------------- */
router.post("/admin/create-user", authMiddleware, adminOnlyMiddleware, async (req, res) => {
  try {
    const { username, email, password, role = "user" } = req.body;
    const normalizedUsername = normalizeUsername(username || "");
    const normalizedEmail = (email || "").trim().toLowerCase();

    if (!normalizedUsername || !normalizedEmail || !password) {
      return res.status(400).json({ error: "Username, email, and password are required" });
    }

    if (looksLikeEmail(normalizedUsername)) {
      return res.status(400).json({ error: "Username cannot be an email address" });
    }

    const existingUser = await User.findOne({
      username: { $regex: `^${escapeRegex(normalizedUsername)}$`, $options: "i" },
    });
    if (existingUser) return res.status(409).json({ error: "Username already exists" });

    const existingEmail = await User.findOne({ email: normalizedEmail });
    if (existingEmail) return res.status(409).json({ error: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username: normalizedUsername,
      email: normalizedEmail,
      password: hashedPassword,
      role,
    });

    await newUser.save();

    if (newUser.role === "user") {
      await ensureUserAdminConversation(newUser._id);
    }

    if (newUser.email) {
      const resetToken = crypto.randomBytes(32).toString("hex");
      newUser.resetPasswordToken = resetToken;
      newUser.resetPasswordExpires = Date.now() + 1000 * 60 * 60; // 1 hour
      await newUser.save();

      sendResetEmail({
        to: newUser.email,
        username: newUser.username,
        resetToken,
        isAdminInvite: true,
      }).catch((mailErr) => {
        console.warn("Admin setup email failed:", mailErr?.message || mailErr);
      });
    }

    res.status(201).json({
      message: "User created by admin successfully. A secure password setup email has been sent.",
      user: newUser,
    });
  } catch (err) {
    console.error("Admin create-user error:", err.message);
    res.status(500).json({ error: "Server error creating user" });
  }
});

export default router;
