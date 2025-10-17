import axios from "axios";

const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5002";

export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // if you are using cookies for auth
});
