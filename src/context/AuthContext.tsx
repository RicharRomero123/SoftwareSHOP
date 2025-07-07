// src/context/AuthContext.tsx
'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import Cookies from 'js-cookie';
import { UserSession } from '../types';

interface AuthContextType {
  user: UserSession | null;
  login: (userData: UserSession) => void;
  logout: () => void;
  isClient: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser: unknown = JSON.parse(storedUser);

        // Verificamos si el objeto tiene estructura de UserSession
        if (
          typeof parsedUser === 'object' &&
          parsedUser !== null &&
          'rol' in parsedUser &&
          (parsedUser as UserSession).rol === 'CLIENTE'
        ) {
          setUser(parsedUser as UserSession);
        } else {
          console.warn(
            'Attempted to load non-CLIENTE user into client app context. Logging out.'
          );
          localStorage.removeItem('user');
          Cookies.remove('user', { path: '/' });
        }
      } catch (e: unknown) {
        console.error('Error parsing user from localStorage', e);
        localStorage.removeItem('user');
        Cookies.remove('user', { path: '/' });
      }
    }
    setLoading(false);
  }, []);

  const login = (userData: UserSession): void => {
    if (userData.rol === 'CLIENTE') {
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      Cookies.set('user', JSON.stringify(userData), { expires: 7, path: '/' });
    } else {
      console.error('Only CLIENTE users can log into this application.');
      logout();
    }
  };

  const logout = (): void => {
    setUser(null);
    localStorage.removeItem('user');
    Cookies.remove('user', { path: '/' });
  };

  const isClient: boolean = user?.rol === 'CLIENTE';

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isClient,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
