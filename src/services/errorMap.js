// ======================== errorMap.js ========================
/**
 * Map backend error codes to human-friendly copy.
 * You can localize here later if needed.
 */
const MESSAGES = {
  // Auth & access
  UNAUTHORIZED: "Please log in to continue.",
  FORBIDDEN: "You don’t have access to this resource.",

  // Users
  EMAIL_TAKEN: "That email is already registered.",

  // Episodes / pipeline
  NOT_FOUND: "We couldn’t find what you requested.",
  BAD_STATE: "This action isn’t allowed in the current state.",
  ALREADY_IN_PROGRESS: "A transcription is already running for this episode.",
  TRANSCRIPT_MISSING: "No transcript yet—try starting a transcription first.",

  // Generic server
  DB_ERROR: "A server error occurred. Please try again shortly.",
  HTTP_ERROR: "We couldn’t complete that request.",
  FETCH_LATEST_FAILED: "We couldn’t refresh the feed right now.",
};

export function humanizeErrorCode(code, fallback) {
  if (!code) return fallback || "Something went wrong.";
  return MESSAGES[code] || fallback || "Something went wrong.";
}

/**
 * Example helper:
 *   import { humanizeApiError } from './errorMap';
 *   try { ... } catch (e) { toast.error(humanizeApiError(e)); }
 */
export function humanizeApiError(err, fallback) {
  if (err && err.code) return humanizeErrorCode(err.code, fallback);
  if (err && typeof err.message === "string" && err.message.trim()) return err.message;
  return fallback || "Something went wrong.";
}
