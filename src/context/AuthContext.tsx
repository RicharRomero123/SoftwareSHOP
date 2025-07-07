// src/context/AuthContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import Cookies from 'js-cookie';
import { UserSession } from '../types';

interface AuthContextType {
    user: UserSession | null;
    login: (userData: UserSession) => void;
    logout: () => void;
    isClient: boolean; // Added for client-specific check
    loading: boolean;

}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<UserSession | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                const parsedUser: UserSession = JSON.parse(storedUser);
                // Only set user if they are a CLIENTE
                if (parsedUser.rol === 'CLIENTE') {
                    setUser(parsedUser);
                } else {
                    // If for some reason an ADMIN tries to log into client app, log them out
                    console.warn('Attempted to load non-CLIENTE user into client app context. Logging out.');
                    localStorage.removeItem('user');
                    Cookies.remove('user', { path: '/' });
                }
            } catch (e) {
                console.error("Error parsing user from localStorage", e);
                localStorage.removeItem('user');
                Cookies.remove('user', { path: '/' });
            }
        }
        setLoading(false);
    }, []);

    const login = (userData: UserSession) => {
        // Ensure only CLIENTE roles can log into this app context
        if (userData.rol === 'CLIENTE') {
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
            Cookies.set('user', JSON.stringify(userData), { expires: 7, path: '/' });
            // Cookies.set('jwtToken', response.token, { expires: 7, path: '/' }); // For JWT
        } else {
            console.error('Only CLIENTE users can log into this application.');
            logout(); // Log out any non-CLIENTE user trying to login
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
        Cookies.remove('user', { path: '/' });
        // Cookies.remove('jwtToken', { path: '/' }); // For JWT
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