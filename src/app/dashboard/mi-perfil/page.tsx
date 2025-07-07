// src/app/dashboard/mi-perfil/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { ClientUser } from '@/types';
import userService from '@/services/userService';
import {
  User, Shield, Coins, FileText, BookOpen, Lock,
  ChevronRight, BadgeInfo, Package, Repeat, HelpCircle, CheckCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

const MiPerfilPage: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const [clientData, setClientData] = useState<ClientUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!authLoading && user?.id) {
        setLoading(true);
        setError(null);
        try {
          const data = await userService.getUserById(user.id);
          setClientData(data);
        } catch (err: unknown) {
          console.error('Error al obtener datos del perfil:', err);
          if (err && typeof err === 'object' && 'response' in err) {
             const axiosErr = err as { response?: { data?: { message?: string } } };
             setError(axiosErr.response?.data?.message || 'Error al cargar los datos de tu perfil.');
          } else if (err instanceof Error) {
             setError(err.message);
          } else {
             setError('Ocurrió un error inesperado.');
          }
        } finally {
          setLoading(false);
        }
      }
    };
    fetchProfileData();
  }, [user, authLoading]);

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] bg-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-lg text-slate-300">Cargando tu perfil...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto p-8 bg-slate-800 rounded-xl shadow-xl mt-8">
        <div className="flex items-start">
          <BadgeInfo className="h-6 w-6 text-red-400 mr-3 mt-0.5" />
          <div>
            <h3 className="text-xl font-bold text-red-400 mb-2">Error al cargar el perfil</h3>
            <p className="text-slate-300">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!clientData) {
    return (
      <div className="max-w-3xl mx-auto p-8 bg-slate-800 rounded-xl shadow-xl mt-8">
        <div className="flex items-start">
          <BadgeInfo className="h-6 w-6 text-yellow-400 mr-3 mt-0.5" />
          <div>
            <h3 className="text-xl font-bold text-yellow-400 mb-2">Datos no disponibles</h3>
            <p className="text-slate-300">No se pudieron cargar los datos de tu perfil en este momento.</p>
          </div>
        </div>
      </div>
    );
  }
  
  const utilitySections = [
    { id: 1, title: 'Política de Privacidad', description: 'Cómo protegemos tus datos.', icon: FileText, href: '/politicas/privacidad' },
    { id: 2, title: 'Términos y Condiciones', description: 'Reglas de uso del servicio.', icon: BookOpen, href: '/politicas/terminos' },
    { id: 3, title: 'Centro de Ayuda', description: 'Preguntas frecuentes y soporte.', icon: HelpCircle, href: '/soporte' },
  ];

  return (
    <div className="min-h-screen bg-slate-900 py-12 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div 
            initial={{ opacity: 0, y: -20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5 }} 
            className="flex flex-col sm:flex-row items-center gap-6 mb-12"
        >
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
              <User className="w-12 h-12 text-white" />
            </div>
             <div className="absolute bottom-0 right-0 w-7 h-7 bg-green-500 rounded-full border-2 border-slate-900 flex items-center justify-center">
                <CheckCircle size={16} className="text-white"/>
             </div>
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white">Bienvenido, {clientData.nombre.split(' ')[0]}</h1>
            <p className="text-lg text-slate-400">Aquí tienes un resumen de tu cuenta y actividad.</p>
          </div>
        </motion.div>

        {/* ✅ SOLUCIÓN: Layout flexible que cambia de columna a fila */}
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Columna Izquierda (en móvil aparece segunda) */}
          <div className="lg:w-2/3 space-y-8 order-2 lg:order-1">
            {/* 2. Información General */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 shadow-lg">
              <h2 className="text-xl font-bold text-white mb-6">Información General</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-slate-400">Nombre Completo</p>
                  <p className="text-base sm:text-lg font-semibold text-white">{clientData.nombre}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Correo Electrónico</p>
                  <p className="text-base sm:text-lg font-semibold text-white break-words">{clientData.email}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Tipo de Cuenta</p>
                  <div className="flex items-center gap-2 text-base sm:text-lg font-semibold text-blue-400">
                    <Shield size={20}/>
                    <p className="capitalize">{clientData.rol.toLowerCase()}</p>
                  </div>
                </div>
                 <div>
                  <p className="text-sm text-slate-400">ID de Usuario</p>
                  <p className="text-xs sm:text-sm font-mono text-slate-500 break-all">{clientData.id}</p>
                </div>
              </div>
            </motion.div>
            
            {/* 3. Mi Actividad */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
                <h2 className="text-xl font-bold text-white mb-4">Mi Actividad</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <Link href="/dashboard/mis-ordenes" className="block bg-slate-800/50 p-6 rounded-2xl border border-slate-700 hover:border-blue-500 hover:-translate-y-1 transition-all">
                        <Package className="w-8 h-8 text-blue-400 mb-3"/>
                        <h3 className="font-bold text-lg text-white">Mis Órdenes</h3>
                        <p className="text-sm text-slate-400">Revisa el estado de tus compras.</p>
                    </Link>
                     <Link href="/dashboard/mis-transacciones" className="block bg-slate-800/50 p-6 rounded-2xl border border-slate-700 hover:border-green-500 hover:-translate-y-1 transition-all">
                        <Repeat className="w-8 h-8 text-green-400 mb-3"/>
                        <h3 className="font-bold text-lg text-white">Mis Transacciones</h3>
                        <p className="text-sm text-slate-400">Consulta tu historial de monedas.</p>
                    </Link>
                </div>
            </motion.div>
            
            {/* 5. Seguridad */}
             <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }}>
                <h2 className="text-xl font-bold text-white mb-4">Seguridad</h2>
                 <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 flex justify-between items-center">
                    <div>
                        <h3 className="font-bold text-lg text-white">Cambiar Contraseña</h3>
                        <p className="text-sm text-slate-400">Se recomienda actualizarla periódicamente.</p>
                    </div>
                    <button className="bg-slate-700 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-600 transition-colors">Actualizar</button>
                 </div>
            </motion.div>
          </div>

          {/* Columna Derecha (en móvil aparece primera) */}
          <div className="lg:w-1/3 space-y-8 order-1 lg:order-2">
            {/* 1. Saldo */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="bg-gradient-to-br from-blue-600/80 to-indigo-700/80 rounded-2xl p-6 shadow-2xl text-white">
              <div className="flex items-center gap-4 mb-4">
                <Coins className="w-8 h-8 text-amber-300"/>
                <h2 className="text-xl font-bold">Tu Saldo</h2>
              </div>
              <p className="text-5xl font-bold text-center my-4">{clientData.monedas}</p>
              <p className="text-center text-blue-200">Monedas VIP</p>
            </motion.div>
            
            {/* 4. Recursos Útiles */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }} className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 shadow-lg">
                <h2 className="text-xl font-bold text-white mb-4">Recursos Útiles</h2>
                <div className="space-y-2">
                    {utilitySections.map(section => (
                        <Link key={section.id} href={section.href} className="flex justify-between items-center p-3 rounded-lg hover:bg-slate-700/50 transition-colors">
                            <div className="flex items-center gap-4">
                                <section.icon className="w-5 h-5 text-slate-400"/>
                                <span className="font-medium text-slate-200">{section.title}</span>
                            </div>
                            <ChevronRight className="w-5 h-5 text-slate-500"/>
                        </Link>
                    ))}
                </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MiPerfilPage;
