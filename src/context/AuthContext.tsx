'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import Cookies from 'js-cookie';
import { UserSession } from '../types'; // Importa UserSession

interface AuthContextType {
    user: UserSession | null;
    login: (userData: UserSession, token: string) => void; // AÑADIDO: token como parámetro
    logout: () => void;
    isClient: boolean;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<UserSession | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const storedToken = Cookies.get('jwtToken'); // Obtener el token de las cookies

        if (storedUser && storedToken) {
            try {
                const parsedUser: UserSession = JSON.parse(storedUser);
                if (parsedUser.rol === 'CLIENTE') {
                    setUser(parsedUser);
                } else {
                    console.warn('Attempted to load non-CLIENTE user into client app context. Logging out.');
                    localStorage.removeItem('user');
                    Cookies.remove('user', { path: '/' });
                    Cookies.remove('jwtToken', { path: '/' }); // Asegurarse de limpiar el token
                }
            } catch (e) {
                console.error("Error parsing user from localStorage or token from cookies", e);
                localStorage.removeItem('user');
                Cookies.remove('user', { path: '/' });
                Cookies.remove('jwtToken', { path: '/' }); // Asegurarse de limpiar el token
            }
        }
        setLoading(false);
    }, []);

    // Modificada para aceptar el token
    const login = (userData: UserSession, token: string) => {
        if (userData.rol === 'CLIENTE') {
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
            Cookies.set('user', JSON.stringify(userData), { expires: 7, path: '/' });
            Cookies.set('jwtToken', token, { expires: 7, path: '/' }); // Guardar el token en las cookies
        } else {
            console.error('Only CLIENTE users can log into this application.');
            logout();
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
        Cookies.remove('user', { path: '/' });
        Cookies.remove('jwtToken', { path: '/' }); // Eliminar el token JWT al cerrar sesión
    };

    const isClient = user?.rol === 'CLIENTE';

    return (
        <AuthContext.Provider value={{ user, login, logout, isClient, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};