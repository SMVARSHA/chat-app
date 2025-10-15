import axios from "axios";

const BASE_URL = "http://localhost:5002"; // matches your backend port

export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // if you are using cookies for auth
});
