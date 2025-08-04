const API_ROOT = process.env.REACT_APP_API_URL || '';

// auth
export async function loginUser({ email, password }) {
  const res = await fetch(`${API_ROOT}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: email, password }), // OAuth2PasswordRequestForm expects 'username'
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function signupUser({ email, password }) {
  const res = await fetch(`${API_ROOT}/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// podcasts
export async function fetchSubscriptions() {
  const token = localStorage.getItem('access_token');
  const res = await fetch(`${API_ROOT}/podcasts`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getPodcast(podcast_id) {
  const token = localStorage.getItem('access_token');
  const res = await fetch(`${API_ROOT}/podcasts/${podcast_id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function subscribePodcast(title, feed_url) {
  const token = localStorage.getItem('access_token');
  const res = await fetch(`${API_ROOT}/podcasts`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ title, feed_url }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function unsubscribePodcast(podcast_id) {
  const token = localStorage.getItem('access_token');
  const res = await fetch(`${API_ROOT}/podcasts/${podcast_id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(await res.text());
  return true;
}

// episodes
export async function fetchEpisodes(podcast_id) {
  const token = localStorage.getItem('access_token');
  const res = await fetch(`${API_ROOT}/episodes/${podcast_id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function fetchLatestEpisode(podcast_id) {
  const token = localStorage.getItem('access_token');
  const res = await fetch(
    `${API_ROOT}/podcasts/${podcast_id}/fetch-latest`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export { API_ROOT };
