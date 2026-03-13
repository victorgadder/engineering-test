const BASE_URL = "https://dev.codeleap.co.uk/careers/";

async function request(url, options = {}) {
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export async function getPosts() {
  const data = await request(BASE_URL);
  const list = Array.isArray(data) ? data : data.results ?? [];
  return list.sort(
    (a, b) => new Date(b.created_datetime) - new Date(a.created_datetime),
  );
}

export function createPost(payload) {
  return request(BASE_URL, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updatePost({ id, title, content }) {
  return request(`${BASE_URL}${id}/`, {
    method: "PATCH",
    body: JSON.stringify({ title, content }),
  });
}

export function deletePost(id) {
  return request(`${BASE_URL}${id}/`, {
    method: "DELETE",
  });
}
