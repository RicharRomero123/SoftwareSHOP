// src/app/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {useAuth} from "@/context/AuthContext";


const HomePage: React.FC = () => {
  const router = useRouter();
  const { user, isClient, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (!user || !isClient) {
        router.push('/login');
      } else {
        router.push('/dashboard');
      }
    }
  }, [user, isClient, loading, router]);

  return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-lg text-gray-700">Cargando aplicación cliente...</p>
      </div>
  );
};

export default HomePage;