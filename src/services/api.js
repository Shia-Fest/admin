import axios from "axios";
const API_URL = 'https://backend-jq71.onrender.com'

const api = axios.create({
    baseURL: API_URL,
})

api.interceptors.request.use(
    (config) => {
        const userInfo = localStorage.getItem('userInfo');

        if (userInfo) {
            const {token} = JSON.parse(userInfo);
            if (token) {
                config.headers.Authorization = `Bearer ${token}`
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error)
    }
)

export default api;