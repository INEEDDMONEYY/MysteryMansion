import mongoose from "mongoose";

const AnalyticsEventSchema = new mongoose.Schema(
  {
    eventType: {
      type: String,
      enum: ["page_view", "heartbeat"],
      required: true,
      index: true,
    },
    sessionId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    pagePath: {
      type: String,
      default: "/",
      trim: true,
    },
    activeSeconds: {
      type: Number,
      default: 0,
      min: 0,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    occurredAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true }
);

AnalyticsEventSchema.index({ eventType: 1, occurredAt: 1 });

const AnalyticsEvent = mongoose.model("AnalyticsEvent", AnalyticsEventSchema);
export default AnalyticsEvent;
