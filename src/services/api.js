// ======================== api.js ========================
/**
 * Unified API client that:
 *  - injects Bearer token
 *  - parses { error: { code, message, details } }
 *  - throws ApiError(status, code, message, details)
 *  - auto-logs out on 401
 */
export const API_ROOT = process.env.REACT_APP_API_URL || "";

export class ApiError extends Error {
  constructor({ status, code = "HTTP_ERROR", message = "Request failed", details = {} }) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

function authHeader() {
  const t = localStorage.getItem("access_token");
  return t ? { Authorization: `Bearer ${t}` } : {};
}

function onUnauthorized() {
  localStorage.removeItem("access_token");
  if (window.location.pathname !== "/login") {
    window.location.replace("/login");
  }
}

async function handleResponse(res) {
  const status = res.status;
  const ct = res.headers.get("content-type") || "";
  const isJson = ct.includes("application/json");
  const body = isJson ? await res.json().catch(() => ({})) : await res.text().catch(() => "");

  if (status >= 200 && status < 300) {
    return isJson ? body : { ok: true, body };
  }

  // Expect { error: { code, message, details } }
  let code, message, details;
  if (isJson && body && body.error) {
    ({ code, message, details } = body.error);
  } else if (isJson && body && body.detail) {
    // FastAPI sometimes returns {"detail": "..."} — normalize
    code = "HTTP_ERROR";
    message = typeof body.detail === "string" ? body.detail : JSON.stringify(body.detail);
  } else {
    code = "HTTP_ERROR";
    message = typeof body === "string" && body.trim() ? body : `Request failed (${status})`;
  }

  if (status === 401) onUnauthorized();
  throw new ApiError({ status, code, message, details });
}

async function request(path, { method = "GET", headers = {}, body, timeoutMs } = {}) {
  const ctrl = new AbortController();
  const timer = timeoutMs ? setTimeout(() => ctrl.abort(), timeoutMs) : null;

  try {
    const res = await fetch(`${API_ROOT}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...authHeader(),
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: ctrl.signal,
      // credentials: "include", // enable if you move to httpOnly cookies
    });
    return await handleResponse(res);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export function formatApiError(err, fallback = "Something went wrong. Please try again.") {
  if (err instanceof ApiError) return err.message || fallback;
  if (err && typeof err.message === "string") return err.message;
  return fallback;
}

// ---------- AUTH ----------
export async function loginUser({ email, password }) {
  return request("/login", {
    method: "POST",
    body: { username: email, password }, // FastAPI OAuth2 expects "username"
  });
}

export async function signupUser({ email, password }) {
  return request("/signup", {
    method: "POST",
    body: { email, password },
  });
}

// ---------- PODCASTS ----------
export async function fetchSubscriptions() {
  return request("/podcasts");
}

export async function getPodcast(podcast_id) {
  return request(`/podcasts/${podcast_id}`);
}

export async function subscribePodcast(title, feed_url) {
  return request("/podcasts", {
    method: "POST",
    body: { title, feed_url },
  }); // { podcast_id, status }
}

export async function unsubscribePodcast(podcast_id) {
  await request(`/podcasts/${podcast_id}`, { method: "DELETE" });
  return true;
}

// ---------- EPISODES ----------
export async function fetchEpisodes(podcast_id, { page = 1, pageSize = 20 } = {}) {
  const qs = new URLSearchParams({ page: String(page), page_size: String(pageSize) }).toString();
  const data = await request(`/episodes/${podcast_id}?${qs}`);
  // Normalization guard (if an older backend returns an array)
  if (Array.isArray(data)) {
    return { items: data, page, page_size: pageSize, total: data.length, total_pages: 1 };
  }
  return data;
}

export async function fetchLatestMetadata(podcast_id, limit = 10) {
  const qs = limit ? `?limit=${encodeURIComponent(String(limit))}` : "";
  return request(`/podcasts/${podcast_id}/fetch-latest${qs}`, { method: "POST" });
}

export async function transcribeAndSummarizeEpisode(episode_id, { summary_words = 800, force = false } = {}) {
  return request(`/episodes/${episode_id}/transcribe-and-summarize`, {
    method: "POST",
    body: { summary_words, force },
  }); // { message, episode_id }
}

export async function getEpisodeDetail(episode_id) {
  return request(`/episodes/${episode_id}/detail`);
}

export async function resetEpisodeTranscription(episodeId, clearOutputs = false, { timeoutMs = 15000 } = {}) {
  return request(`/episodes/${episodeId}/transcription/reset?clear_outputs=${clearOutputs}`, {
    method: "POST",
    timeoutMs,
    headers: { Accept: "application/json" },
  });
}

export async function resummarizeEpisode(episodeId, { summary_words = 800 } = {}) {
  return request(`/episodes/${episodeId}/resummarize?summary_words=${encodeURIComponent(String(summary_words))}`, {
    method: "POST",
    headers: { Accept: "application/json" },
  });
}
