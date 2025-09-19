import axios from "axios";
const API_URL = 'http://localhost:5001/api'

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