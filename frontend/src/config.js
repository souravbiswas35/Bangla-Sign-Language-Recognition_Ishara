// Centralized configuration for backend API and WebSocket endpoints.
// Supports both local development (with Vite proxy) and production deployment (Vercel + Render/Railway).

export const BACKEND_URL = (import.meta.env.VITE_BACKEND_URL || '').replace(/\/+$/, '');

/**
 * Returns the full API URL for a given relative endpoint.
 * E.g. apiUrl('/api/models') -> 'https://your-backend.onrender.com/api/models' (in production)
 *                           or '/api/models' (locally via Vite proxy)
 */
export const apiUrl = (endpoint) => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  if (!BACKEND_URL) return cleanEndpoint;
  return `${BACKEND_URL}${cleanEndpoint}`;
};

/**
 * Generates the WebSocket URL matching the active protocol and backend host.
 */
export const getWsUrl = (path = '/ws/predict') => {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;

  // If explicit WebSocket URL is configured:
  if (import.meta.env.VITE_WS_URL) {
    return `${import.meta.env.VITE_WS_URL.replace(/\/+$/, '')}${cleanPath}`;
  }

  // If BACKEND_URL is set (e.g. deployed backend https://...):
  if (BACKEND_URL) {
    const wsProto = BACKEND_URL.startsWith('https') ? 'wss' : 'ws';
    const host = BACKEND_URL.replace(/^https?:\/\//, '');
    return `${wsProto}://${host}${cleanPath}`;
  }

  // Fallback to current browser host (local dev):
  const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
  return isHttps
    ? `wss://${window.location.host}${cleanPath}`
    : `ws://${window.location.hostname}:8000${cleanPath}`;
};
