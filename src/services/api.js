// api.js
const API_ROOT = process.env.REACT_APP_API_URL || "";

// ---- auth ---------------------------------------------------
export async function loginUser({ email, password }) {
  const res = await fetch(`${API_ROOT}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: email, password }), // FastAPI OAuth2 expects "username"
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
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
  return { Authorization: `Bearer ${token}` };
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
export async function fetchEpisodes(podcast_id) {
  const res = await fetch(`${API_ROOT}/episodes/${podcast_id}`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

/**
 * Queue metadata-only refresh for latest N episodes.
 * Matches POST /podcasts/{podcast_id}/fetch-latest?limit=10
 */
export async function fetchLatestMetadata(podcast_id, limit = 10) {
  const url = new URL(`${API_ROOT}/podcasts/${podcast_id}/fetch-latest`);
  if (limit) url.searchParams.set("limit", String(limit));

  const res = await fetch(url.toString(), {
    method: "POST",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(await res.text());
  // returns { status: "queued", limit }
  return res.json();
}

/**
 * Trigger on-demand transcription + summary for a chosen episode.
 * Matches POST /episodes/{episode_id}/transcribe-and-summarize
 */
export async function transcribeAndSummarizeEpisode(episode_id, { summary_words = 800, force = false } = {}) {
  const res = await fetch(`${API_ROOT}/episodes/${episode_id}/transcribe-and-summarize`, {
    method: "POST",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({ summary_words, force }),
  });
  if (!res.ok) throw new Error(await res.text());
  // returns { message: "Queued", episode_id }
  return res.json();
}

export { API_ROOT };
