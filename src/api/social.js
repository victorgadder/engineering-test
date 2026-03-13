const SOCIAL_API_BASE_URL = "https://jsonplaceholder.typicode.com";

function normalizeResourceId(id) {
  const numericId = Number(id);
  if (Number.isFinite(numericId) && numericId > 0) {
    return numericId;
  }
  return 1;
}

async function request(url, options = {}) {
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`Social API failed with status ${response.status}`);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export function registerLikeInteraction(payload) {
  return request(`${SOCIAL_API_BASE_URL}/posts`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function registerCommentCreate(payload) {
  return request(`${SOCIAL_API_BASE_URL}/comments`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function registerCommentUpdate({ id, ...payload }) {
  return request(`${SOCIAL_API_BASE_URL}/comments/${normalizeResourceId(id)}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function registerCommentDelete(id) {
  return request(`${SOCIAL_API_BASE_URL}/comments/${normalizeResourceId(id)}`, {
    method: "DELETE",
  });
}
