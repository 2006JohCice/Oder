export const apiFetch = async (url, options = {}) => {
  const res = await fetch(url, {
    credentials: "include",
    ...options,
  });

  if (res.status === 401) {
    const error = new Error("Unauthorized");
    error.status = 401;
    throw error;
  }

  if (res.status === 403) {
    const error = new Error("Forbidden");
    error.status = 403;
    throw error;
  }

  return res.json();
};
