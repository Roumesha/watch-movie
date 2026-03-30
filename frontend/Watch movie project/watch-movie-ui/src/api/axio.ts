import axios from "axios";

const API = axios.create({
 baseURL: "https://watch-movie-hodo.onrender.com",
});

// 🔐 Automatically attach JWT
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");

  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }

  return req;
});

export default API;
