import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000",
  withCredentials: false,
});

api.interceptors.request.use(
  (config) => {
    const stored = localStorage.getItem("ideaAuth");

    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed?.token) {
        config.headers.Authorization = `Bearer ${parsed.token}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;