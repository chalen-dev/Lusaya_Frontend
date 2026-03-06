// api.js
import axios from 'axios';
import {LARAVEL_APP_API_URL} from "./constants";

const api = axios.create({
    baseURL: LARAVEL_APP_API_URL,
});

// Request interceptor – adds token to every request
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default api;