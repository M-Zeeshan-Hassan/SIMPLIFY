// src/Services/api.js
import axios from "axios";
import { logout } from "../Features/AuthSlice";

let reduxStore; // yahan store runtime pe inject hoga

export const injectStore = (store) => {
  reduxStore = store;
};

const api = axios.create({
  baseURL: "http://localhost:8000/api",
  withCredentials: true,
});

// Interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message;

      if (status === 401 || status === 403) {
        console.warn("Session expired:", message);

        // ⚡️ Redux logout call karo
        if (reduxStore) {
          reduxStore.dispatch(logout());
        }

        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
