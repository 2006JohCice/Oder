export const apiFetch = async (url, options = {}) => {
  const method = (options.method || "GET").toUpperCase();
  const isMutation = method !== "GET";
  const shouldLoad = options.showLoading !== undefined ? options.showLoading : isMutation;

  // Dispatch custom event to start loading
  if (typeof window !== "undefined" && shouldLoad) {
    window.dispatchEvent(new CustomEvent("api:loading:start"));
  }

  try {
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
  } finally {
    // Dispatch custom event to end loading
    if (typeof window !== "undefined" && shouldLoad) {
      window.dispatchEvent(new CustomEvent("api:loading:end"));
    }
  }
};
