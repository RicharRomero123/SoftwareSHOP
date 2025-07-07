// my-client-app/src/app/dashboard/mi-perfil/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from "@/context/AuthContext";
import { ClientUser } from "@/types";
import userService from "@/services/userService";
import {
    User, Shield, Coins, FileText, File, BookOpen, Lock,
    ArrowRight, ChevronRight, BadgeInfo
} from 'lucide-react';
import { motion } from 'framer-motion';

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
                } catch (err: any) {
                    console.error('Error al obtener datos del perfil:', err);
                    setError(err.response?.data?.message || 'Error al cargar los datos de tu perfil.');
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
                    <p className="text-lg text-slate-300">Cargando datos de perfil...</p>
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
                        <p className="text-slate-300">No se pudieron cargar los datos de tu perfil.</p>
                    </div>
                </div>
            </div>
        );
    }

    // Secciones de utilidad
    const utilitySections = [
        {
            id: 1,
            title: "Política de privacidad",
            description: "Conoce cómo protegemos tus datos personales",
            icon: FileText,
            disabled: false
        },
        {
            id: 2,
            title: "Términos y condiciones",
            description: "Consulta las condiciones de uso de nuestros servicios",
            icon: File,
            disabled: false
        },
        {
            id: 3,
            title: "Libro de reclamaciones",
            description: "Registra una queja o sugerencia sobre nuestros servicios",
            icon: BookOpen,
            disabled: false
        },
        {
            id: 4,
            title: "Cambiar contraseña",
            description: "Actualiza tu contraseña de acceso",
            icon: Lock,
            disabled: true
        }
    ];

    return (
        <div className="min-h-[calc(100vh-80px)] bg-slate-900 py-12 px-4 sm:px-6">
            <div className="max-w-3xl mx-auto">
                {/* Encabezado */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-12"
                >
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
                        Mi Perfil
                    </h1>
                    <p className="text-lg text-slate-300 max-w-2xl mx-auto">
                        Administra tu información personal y accede a recursos importantes
                    </p>
                    <div className="h-1 w-20 bg-gradient-to-r from-blue-500 to-indigo-600 mx-auto mt-4 rounded-full"></div>
                </motion.div>

                {/* Información del usuario */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-700"
                    >
                        <div className="flex items-center mb-6">
                            <div className="bg-blue-900/30 p-3 rounded-lg mr-4">
                                <User className="h-8 w-8 text-blue-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-medium text-slate-300">Información personal</h3>
                                <p className="text-sm text-slate-500">Detalles de tu cuenta</p>
                            </div>
                        </div>

                        <div className="space-y-5">
                            <div>
                                <p className="text-sm font-medium text-slate-500 mb-1">Nombre completo</p>
                                <p className="text-lg font-semibold text-white">{clientData.nombre}</p>
                            </div>

                            <div>
                                <p className="text-sm font-medium text-slate-500 mb-1">Correo electrónico</p>
                                <p className="text-lg font-semibold text-white">{clientData.email}</p>
                            </div>

                            <div>
                                <p className="text-sm font-medium text-slate-500 mb-1">Tipo de cuenta</p>
                                <div className="flex items-center">
                                    <Shield className="h-5 w-5 text-blue-400 mr-2" />
                                    <p className="text-lg font-semibold text-white capitalize">{clientData.rol}</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="bg-gradient-to-br from-blue-900/30 to-indigo-900/30 rounded-xl p-6 shadow-lg border border-blue-800/30"
                    >
                        <div className="flex items-center mb-6">
                            <div className="bg-amber-500/20 p-3 rounded-lg mr-4">
                                <Coins className="h-8 w-8 text-amber-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-medium text-slate-300">Monedas disponibles</h3>
                                <p className="text-sm text-slate-400">Tu saldo actual en el sistema</p>
                            </div>
                        </div>

                        <div className="flex flex-col items-center justify-center py-4">
                            <div className="text-5xl font-bold text-amber-400 mb-2">
                                {clientData.monedas}
                            </div>
                            <p className="text-lg font-medium text-white">Monedas VIP</p>
                        </div>

                        <div className="mt-8 pt-4 border-t border-blue-800/30">
                            <p className="text-sm text-slate-400 text-center">
                                Las monedas VIP son la moneda oficial de SISTEMASVIP.SHOP para adquirir servicios
                            </p>
                        </div>
                    </motion.div>
                </div>

                {/* Secciones de utilidad */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-700"
                >
                    <div className="flex items-center mb-8">
                        <div className="bg-slate-700 p-2 rounded-lg mr-3">
                            <ArrowRight className="h-6 w-6 text-blue-400" />
                        </div>
                        <h2 className="text-xl font-bold text-white">Recursos y utilidades</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {utilitySections.map((section) => (
                            <motion.div
                                key={section.id}
                                whileHover={{ y: -5 }}
                                className={`bg-slate-700/50 rounded-lg p-5 border border-slate-600 transition-all duration-300 ${
                                    section.disabled ? 'opacity-60 cursor-not-allowed' : 'hover:border-blue-500 hover:bg-slate-700 cursor-pointer'
                                }`}
                            >
                                <div className="flex items-start">
                                    <div className="mr-4 mt-1">
                                        <section.icon
                                            className={`h-6 w-6 ${
                                                section.disabled ? 'text-slate-500' : 'text-blue-400'
                                            }`}
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className={`text-lg font-medium mb-1 ${
                                            section.disabled ? 'text-slate-500' : 'text-white'
                                        }`}>
                                            {section.title}
                                        </h3>
                                        <p className="text-sm text-slate-400 mb-3">
                                            {section.description}
                                        </p>
                                        <div className="flex justify-between items-center">
                                            <span className={`text-xs px-2 py-1 rounded ${
                                                section.disabled
                                                    ? 'bg-slate-800 text-slate-500'
                                                    : 'bg-blue-900/30 text-blue-400'
                                            }`}>
                                                {section.disabled ? 'Próximamente' : 'Disponible'}
                                            </span>
                                            {!section.disabled && (
                                                <ChevronRight className="h-5 w-5 text-blue-400" />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Nota final */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="mt-8 bg-slate-800/50 border border-slate-700 rounded-xl p-6 text-center"
                >
                    <p className="text-slate-400">
                        ¿Necesitas ayuda? Contacta a nuestro soporte técnico en
                        <span className="text-blue-400 ml-1">soporte@sistemasvip.shop</span>
                    </p>
                </motion.div>
            </div>
        </div>
    );
};

export default MiPerfilPage;