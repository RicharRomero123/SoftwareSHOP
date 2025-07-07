'use client';

import React, { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from "@/context/AuthContext";
import ClientNav from '@/components/ClientNav';

interface ClientDashboardLayoutProps {
    children: ReactNode;
}

const ClientDashboardLayout: React.FC<ClientDashboardLayoutProps> = ({ children }) => {
    const { user, isClient, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (!user) {
                router.push('/login'); // Not logged in
            } else if (!isClient) {
                router.push('/login'); // Logged in but not a CLIENTE
            }
        }
    }, [user, isClient, loading, router]);

    if (loading || !user || !isClient) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0f172a]">
                <p className="text-lg text-white">Verificando acceso de cliente...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-[#0f172a]">
            <ClientNav />
            <main className="flex-grow pt-20 p-8"> {/* pt-20 to account for fixed navbar */}
                {children}
            </main>
        </div>
    );
};

export default ClientDashboardLayout;
