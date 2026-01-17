import axios from "axios";

const axiosClient = axios.create({
  baseURL:
    import.meta.env.VITE_API_BASE_URL ||
    "https://laundromat-server.vercel.app/api/v1",
  headers: {
    "Content-Type": "application/json",
    "X-Client-Type": "web",
  },
  withCredentials: true,
});

export default axiosClient;
