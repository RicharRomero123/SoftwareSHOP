// src/app/login/page.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from "@/context/AuthContext";
import { authService } from "@/services/authService";
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const LoginPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth();
    const router = useRouter();

    const title = "SISTEMASVIP.SHOP";
    const letters = title.split("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            const response = await authService.login({ email, password });

            if (response.rol === 'CLIENTE') {
                login({
                    id: response.id,
                    nombre: response.nombre,
                    email: response.email,
                    rol: response.rol,
                });
                router.push('/dashboard');
            } else {
                setError('Acceso denegado: Solo clientes pueden acceder a este panel.');
            }
        } catch (err: unknown) {
            if (err && typeof err === 'object' && 'response' in err) {
                const axiosErr = err as { response?: { data?: { message?: string } } };
                setError(axiosErr.response?.data?.message || 'Error al iniciar sesión. Verifica tus credenciales.');
            } else {
                setError('Error inesperado al iniciar sesión.');
            }
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
            {/* Fondo animado */}
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

            {/* Título animado */}
            <motion.div
                className="absolute top-8 w-full max-w-md px-4 z-10"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
            >
                <div className="flex justify-center">
                    <AnimatePresence>
                        {letters.map((letter, index) => (
                            <motion.span
                                key={index}
                                className="text-3xl font-bold text-white font-mono tracking-wider"
                                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{
                                    duration: 0.4,
                                    delay: index * 0.07,
                                    type: "spring",
                                    stiffness: 200,
                                    damping: 12
                                }}
                                whileHover={{
                                    y: -5,
                                    scale: 1.1,
                                    color: "#60a5fa",
                                    transition: { duration: 0.2 }
                                }}
                            >
                                {letter === '.' ? <span className="text-blue-400">.</span> : letter}
                            </motion.span>
                        ))}
                    </AnimatePresence>
                </div>
                <motion.div
                    className="h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent mx-auto mt-2"
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ delay: letters.length * 0.07 + 0.3, duration: 0.8 }}
                />
            </motion.div>

            {/* Formulario */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
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
                            className="bg-gradient-to-r from-blue-600 to-indigo-700 p-4 rounded-2xl mb-4"
                        >
                            <User className="h-12 w-12 text-white" />
                        </motion.div>
                        <p className="text-gray-600 mt-2">Bienvenido Cliente</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
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

                        <div className="space-y-2">
                            <label className="text-gray-700 font-medium flex items-center">
                                <Lock className="h-4 w-4 mr-2 text-blue-600" />
                                Contraseña
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    className="w-full py-3 px-4 pl-10 pr-10 text-gray-800 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    placeholder="••••••••"
                                />
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <button
                                    type="button"
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors duration-300"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm"
                            >
                                {error}
                            </motion.div>
                        )}

                        <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-all duration-300 flex items-center justify-center"
                        >
                            <Lock className="h-5 w-5 mr-2" />
                            Iniciar Sesión
                        </motion.button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-gray-200">
                        <p className="text-center text-gray-600 text-sm">
                            ¿No tienes una cuenta?{' '}
                            <Link href="/register" className="font-semibold text-blue-600 hover:text-blue-800 transition-colors duration-300">
                                Regístrate aquí
                            </Link>
                        </p>
                    </div>
                </motion.div>

                <div className="mt-6 text-center">
                    <p className="text-sm text-white/80">
                        © {new Date().getFullYear()} SISTEMASVIP.SHOP. Todos los derechos reservados.
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default LoginPage;
