// ======================== api.js ========================
const API_ROOT = process.env.REACT_APP_API_URL || "";

// ---- auth ---------------------------------------------------
export async function loginUser({ email, password }) {
  const res = await fetch(`${API_ROOT}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    // FastAPI OAuth2 expects "username"
    body: JSON.stringify({ username: email, password }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json(); // { access_token, token_type }
}

export async function signupUser({ email, password }) {
  const res = await fetch(`${API_ROOT}/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// ---- helpers ------------------------------------------------
function authHeaders() {
  const token = localStorage.getItem("access_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ---- podcasts -----------------------------------------------
export async function fetchSubscriptions() {
  const res = await fetch(`${API_ROOT}/podcasts`, { headers: authHeaders() });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getPodcast(podcast_id) {
  const res = await fetch(`${API_ROOT}/podcasts/${podcast_id}`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function subscribePodcast(title, feed_url) {
  const res = await fetch(`${API_ROOT}/podcasts`, {
    method: "POST",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({ title, feed_url }),
  });
  if (!res.ok) throw new Error(await res.text());
  // returns { podcast_id, status }
  return res.json();
}

export async function unsubscribePodcast(podcast_id) {
  const res = await fetch(`${API_ROOT}/podcasts/${podcast_id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(await res.text());
  return true;
}

// ---- episodes -----------------------------------------------

/**
 * Selection payload for a podcast's episodes.
 * Backend: GET /episodes/{podcast_id}
 * Returns array of:
 * { id, title, pub_date, duration_seconds, image_url,
 *   has_summary_html, has_transcript_html, transcript_status, transcript_origin }
 */
export async function fetchEpisodes(podcast_id) {
  const res = await fetch(`${API_ROOT}/episodes/${podcast_id}`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

/**
 * Queue metadata-only refresh for latest N episodes.
 * Backend: POST /podcasts/{podcast_id}/fetch-latest?limit=10
 * Returns: { status: "queued", limit }
 */
export async function fetchLatestMetadata(podcast_id, limit = 10) {
  const url = new URL(`${API_ROOT}/podcasts/${podcast_id}/fetch-latest`, window.location.origin);
  if (limit) url.searchParams.set("limit", String(limit));

  const res = await fetch(url.toString().replace(window.location.origin, ""), {
    method: "POST",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

/**
 * Trigger on-demand transcription + summary for a chosen episode.
 * Backend: POST /episodes/{episode_id}/transcribe-and-summarize
 * Body: { summary_words, force }
 * Returns: { message: "Queued", episode_id }
 */
export async function transcribeAndSummarizeEpisode(
  episode_id,
  { summary_words = 800, force = false } = {}
) {
  const res = await fetch(`${API_ROOT}/episodes/${episode_id}/transcribe-and-summarize`, {
    method: "POST",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({ summary_words, force }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

/**
 * Fetch full episode details (summary + transcript) on demand for dialogs.
 * Backend (add in main.py if not present):
 *   GET /episodes/{episode_id}/detail
 * Returns: { id, summary, transcript, transcript_status, transcript_origin }
 */
export async function getEpisodeDetail(episode_id) {
  const res = await fetch(`${API_ROOT}/episodes/${episode_id}/detail`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

/**
 * Optional: preview stripped RSS metadata (summary_plain + transcript_html preview).
 * Backend (optional route in main.py):
 *   GET /episodes/{episode_id}/metadata-preview
 * Returns: { episode_id, summary_plain, has_transcript_html, transcript_html_preview? }
 */
export async function getMetadataPreview(episode_id) {
  const res = await fetch(`${API_ROOT}/episodes/${episode_id}/metadata-preview`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export { API_ROOT };
