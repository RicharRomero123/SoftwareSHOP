// src/app/register/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from "@/context/AuthContext";
import { authService } from "@/services/authService";
import { User, Mail, Lock, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

// Componente para partículas que solo se renderiza en cliente
const ClientOnlyParticles = () => {
    return (
        <div className="absolute inset-0 overflow-hidden">
            {[...Array(30)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute rounded-full bg-gradient-to-r from-blue-600/10 to-indigo-600/10"
                    initial={{
                        width: `${Math.random() * 10 + 5}rem`,
                        height: `${Math.random() * 10 + 5}rem`,
                        top: `${Math.random() * 100}%`,
                        left: `${Math.random() * 100}%`,
                        opacity: Math.random() * 0.2 + 0.05
                    }}
                    animate={{
                        top: `${Math.random() * 100}%`,
                        left: `${Math.random() * 100}%`,
                        scale: [1, 1.2, 1]
                    }}
                    transition={{
                        duration: Math.random() * 10 + 15,
                        repeat: Infinity,
                        repeatType: "reverse",
                        delay: Math.random() * 5
                    }}
                />
            ))}
        </div>
    );
};

const RegisterPage: React.FC = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isClient, setIsClient] = useState(false); // Para renderizado condicional
    const { login } = useAuth();
    const router = useRouter();

    useEffect(() => {
        setIsClient(true);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        try {
            const response = await authService.register({ nombre: name, email, password });

            if (response.rol === 'CLIENTE') {
                login({
                    id: response.id,
                    nombre: response.nombre,
                    email: response.email,
                    rol: response.rol,
                });
                setSuccess('¡Registro exitoso! Redirigiendo a tu panel...');
                setTimeout(() => router.push('/dashboard'), 1500);
            } else {
                setError('Error en el registro: Rol de usuario inesperado.');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al registrarte. Intenta de nuevo.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-slate-900 to-blue-950">
            {/* Fondo con partículas animadas (solo en cliente) */}
            {isClient && <ClientOnlyParticles />}

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
                className="w-full max-w-md z-20"
            >
                <motion.div
                    whileHover={{ y: -5 }}
                    className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 w-full"
                >
                    <div className="flex flex-col items-center mb-8">
                        <motion.div
                            whileHover={{ rotate: 10, scale: 1.1 }}
                            whileTap={{ rotate: -10, scale: 0.95 }}
                            className="bg-gradient-to-r from-blue-700 to-indigo-800 p-4 rounded-2xl mb-4"
                        >
                            <User className="h-12 w-12 text-white" />
                        </motion.div>
                        <h2 className="text-2xl font-bold text-center text-gray-800">Crear Cuenta</h2>
                        <p className="text-gray-600 mt-2">Regístrate para comenzar</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Campo Nombre */}
                        <div className="space-y-2">
                            <label className="text-gray-700 font-medium flex items-center">
                                <User className="h-4 w-4 mr-2 text-blue-600" />
                                Nombre Completo
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    className="w-full py-3 px-4 pl-10 text-gray-800 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    placeholder="Tu Nombre"
                                />
                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            </div>
                        </div>

                        {/* Campo Email */}
                        <div className="space-y-2">
                            <label className="text-gray-700 font-medium flex items-center">
                                <Mail className="h-4 w-4 mr-2 text-blue-600" />
                                Correo Electrónico
                            </label>
                            <div className="relative">
                                <input
                                    type="email"
                                    className="w-full py-3 px-4 pl-10 text-gray-800 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    placeholder="tu@email.com"
                                />
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            </div>
                        </div>

                        {/* Campo Contraseña */}
                        <div className="space-y-2">
                            <label className="text-gray-700 font-medium flex items-center">
                                <Lock className="h-4 w-4 mr-2 text-blue-600" />
                                Contraseña
                            </label>
                            <div className="relative">
                                <input
                                    type="password"
                                    className="w-full py-3 px-4 pl-10 pr-10 text-gray-800 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    placeholder="••••••••"
                                />
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            </div>
                        </div>

                        {/* Mensajes de estado */}
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm"
                            >
                                {error}
                            </motion.div>
                        )}
                        {success && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm"
                            >
                                {success}
                            </motion.div>
                        )}

                        {/* Botón de Registro */}
                        <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            className="w-full bg-gradient-to-r from-blue-700 to-indigo-800 hover:from-blue-800 hover:to-indigo-900 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-all duration-300 flex items-center justify-center"
                        >
                            Crear Cuenta
                            <ArrowRight className="h-5 w-5 ml-2" />
                        </motion.button>
                    </form>

                    {/* Enlace de Login */}
                    <div className="mt-8 pt-6 border-t border-gray-200">
                        <p className="text-center text-gray-600 text-sm">
                            ¿Ya tienes una cuenta?{' '}
                            <Link
                                href="/login"
                                className="font-semibold text-blue-600 hover:text-blue-800 transition-colors duration-300 relative"
                            >
                                <span className="relative">
                                    Inicia Sesión
                                    <motion.span
                                        className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600"
                                        initial={{ scaleX: 0 }}
                                        whileHover={{ scaleX: 1 }}
                                        transition={{ duration: 0.3 }}
                                    />
                                </span>
                            </Link>
                        </p>
                    </div>
                </motion.div>

                {/* Footer */}
                <div className="mt-2 text-center">
                    <p className="text-sm text-white/30">
                        © {new Date().getFullYear()} SISTEMASVIP.SHOP. Todos los derechos reservados.
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default RegisterPage;