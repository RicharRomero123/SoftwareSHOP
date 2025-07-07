// src/app/layout.tsx
import type { Metadata } from 'next/types';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '../context/AuthContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'Client Dashboard',
    description: 'Panel de cliente para gestionar servicios y órdenes.',
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="es">
        <body className={inter.className}>
        <AuthProvider>
            {children}
        </AuthProvider>
        </body>
        </html>
    );
}