// src/lib/axiosClient.ts
import axios from 'axios';
import Cookies from 'js-cookie';

const axiosClient = axios.create({
    baseURL: 'http://localhost:8080', // Base URL for your API
    headers: {
        'Content-Type': 'application/json',
    },
});

axiosClient.interceptors.request.use(
    (config) => {
        // Uncomment and adapt if your API uses JWT tokens for client routes
        // const token = Cookies.get('jwtToken');
        // if (token) {
        //   config.headers.Authorization = `Bearer ${token}`;
        // }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Optional: Add a response interceptor to handle 401 Unauthorized errors
axiosClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            console.warn('Unauthorized request. Clearing session.');
            Cookies.remove('user', { path: '/' });
            localStorage.removeItem('user');
            // window.location.href = '/login'; // Redirect to login on 401
        }
        return Promise.reject(error);
    }
);

export default axiosClient;