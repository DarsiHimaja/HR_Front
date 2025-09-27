import axios from "axios";
const api = axios.create({
  baseURL:"backend2-1-labd.onrender.com",
});
api.interceptors.request.use(cfg => {
  const token = localStorage.getItem("token");
  if(token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});
export default api;
