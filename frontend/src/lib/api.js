const BASE = import.meta.env.PROD 
  ? 'https://cd-assignment.onrender.com/api'
  : '/api';

async function request(url, options = {}) {
  const res = await fetch(`${BASE}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Request failed');
  }
  return res.json();
}

export const api = {
  getCars: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/cars${qs ? `?${qs}` : ''}`);
  },

  getCarById: (id) => request(`/cars/${id}`),

  getFilters: () => request('/cars/filters'),

  compareCars: (ids) => request(`/cars/compare?ids=${ids.join(',')}`),

  getRecommendations: (prefs) =>
    request('/recommendations', {
      method: 'POST',
      body: JSON.stringify(prefs),
    }),

  getHealth: () => request('/health'),
};
