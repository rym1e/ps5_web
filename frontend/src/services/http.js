export const createHttpClient = () => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || '';

  const request = async (path, options = {}) => {
    const response = await fetch(`${baseUrl}${path}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      },
      ...options
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || '请求失败');
    }
    if (response.status === 204) return null;
    return response.json();
  };

  return { request };
};
