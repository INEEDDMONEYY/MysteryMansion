import mongoose from 'mongoose';

export const SEARCH_RETENTION_DAYS = 35;

// One row per (term, visitor, day) so a single visitor can't inflate a term.
const SearchQuerySchema = new mongoose.Schema(
  {
    term: { type: String, required: true, trim: true, lowercase: true, maxlength: 40 },
    // Salted hash of the visitor (user id or IP + user agent) — never the raw IP.
    visitorKey: { type: String, required: true },
    day: { type: String, required: true }, // YYYY-MM-DD (UTC)
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

SearchQuerySchema.index({ term: 1, visitorKey: 1, day: 1 }, { unique: true });
SearchQuerySchema.index({ createdAt: 1 }, { expireAfterSeconds: SEARCH_RETENTION_DAYS * 24 * 60 * 60 });

const SearchQuery = mongoose.model('SearchQuery', SearchQuerySchema);
export default SearchQuery;
