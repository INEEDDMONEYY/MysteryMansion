import User from "../../models/User.js";

const RESTRICTION_LABELS = {
  "no-posting": "Posting is disabled for your account.",
  "no-comments": "Messaging/commenting is disabled for your account.",
  "read-only": "Your account is in read-only mode.",
};

const ACTION_BLOCKLIST = {
  "post:create": ["no-posting", "read-only"],
  "post:update": ["no-posting", "read-only"],
  "post:delete": ["no-posting", "read-only"],
  "message:send": ["no-comments", "read-only"],
  "conversation:create": ["no-comments", "read-only"],
  "comment:create": ["no-comments", "read-only"],
  "comment:update": ["no-comments", "read-only"],
  "comment:delete": ["no-comments", "read-only"],
  "profile:update": ["read-only"],
};

export const enforceRestriction = (action) => {
  return async (req, res, next) => {
    try {
      // Always fetch latest user state so newly applied restrictions take effect immediately.
      const currentUser = await User.findById(req.user?._id || req.user?.id).select("roleRestriction");
      const restriction = currentUser?.roleRestriction || "";
      if (!restriction) return next();

      const blockedRestrictions = ACTION_BLOCKLIST[action] || ["read-only"];
      if (!blockedRestrictions.includes(restriction)) return next();

      return res.status(403).json({
        error: RESTRICTION_LABELS[restriction] || "This action is restricted for your account.",
        restriction,
        action,
      });
    } catch (err) {
      return res.status(500).json({ error: "Failed to validate account restriction" });
    }
  };
};
