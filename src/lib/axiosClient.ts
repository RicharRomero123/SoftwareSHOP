// src/lib/axiosClient.ts
import axios from 'axios';
import Cookies from 'js-cookie';

const axiosClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

axiosClient.interceptors.request.use(
    (config) => {
        // Obtener el token de las cookies
        const token = Cookies.get('jwtToken');
        if (token) {
            // Si existe el token, añadirlo al encabezado de autorización
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor de respuesta para manejar errores 401 Unauthorized
axiosClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            console.warn('Unauthorized request. Clearing session and redirecting to login.');
            // Limpiar la sesión y el token JWT
            Cookies.remove('user', { path: '/' });
            localStorage.removeItem('user');
            Cookies.remove('jwtToken', { path: '/' }); // Eliminar el token JWT de las cookies
            window.location.href = '/login'; // Redirigir a la página de login
        }
        return Promise.reject(error);
    }
);

export default axiosClient;