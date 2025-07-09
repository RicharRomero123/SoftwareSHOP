// src/app/register/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from "@/context/AuthContext";
import { authService } from "@/services/authService";
import { User, Mail, Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- INTERFAZ PARA ERRORES DE API ---
interface ApiError {
    response?: {
        data?: {
            message?: string;
        };
    };
}

const ClientOnlyParticles: React.FC = () => {
    return (
        <div className="absolute inset-0 overflow-hidden">
            {[...Array(30)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute rounded-full bg-gradient-to-r from-blue-600/10 to-indigo-600/10"
                    initial={{ width: `${Math.random() * 10 + 5}rem`, height: `${Math.random() * 10 + 5}rem`, top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`, opacity: Math.random() * 0.2 + 0.05 }}
                    animate={{ top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`, scale: [1, 1.2, 1] }}
                    transition={{ duration: Math.random() * 10 + 15, repeat: Infinity, repeatType: "reverse", delay: Math.random() * 5 }}
                />
            ))}
        </div>
    );
};

const RegisterPage: React.FC = () => {
    const [step, setStep] = useState(1); // 1 for registration, 2 for verification
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isClient, setIsClient] = useState(false);
    const { login } = useAuth();
    const router = useRouter();

    useEffect(() => {
        setIsClient(true);
    }, []);

    const handleRequestCode = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsLoading(true);

        try {
            // ✅ SOLUCIÓN: Usar la función renombrada para mayor claridad
            const response = await authService.requestRegistration({ nombre: name, email, password });
            setSuccess(response.message); // "Código de verificación enviado a..."
            setStep(2); // Avanza al paso de verificación
        } catch (err: unknown) {
            const apiError = err as ApiError;
            const message = apiError.response?.data?.message || 'Error al solicitar el registro. Intenta de nuevo.';
            setError(message);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleVerifyCode = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsLoading(true);

        try {
            // ✅ SOLUCIÓN: Se cambió 'code' por 'codigo' para que coincida con el backend
            const response = await authService.verifyCode({
                email,
                codigo: verificationCode, // Asegúrate de que el backend espera 'code'
            });
            
            login({
                id: response.id,
                nombre: response.nombre,
                email: response.email,
                rol: response.rol,
            }, response.token);

            setSuccess('¡Cuenta verificada! Redirigiendo a tu panel...');
            setTimeout(() => router.push('/dashboard'), 1500);

        } catch (err: unknown) {
            const apiError = err as ApiError;
            const message = apiError.response?.data?.message || 'Código incorrecto o expirado. Intenta de nuevo.';
            setError(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-slate-900 to-blue-950">
            {isClient && <ClientOnlyParticles />}

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
                className="w-full max-w-md z-20"
            >
                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 50 }}
                            transition={{ duration: 0.5 }}
                        >
                            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 w-full">
                                <div className="flex flex-col items-center mb-8">
                                    <motion.div whileHover={{ rotate: 10, scale: 1.1 }} whileTap={{ rotate: -10, scale: 0.95 }} className="bg-gradient-to-r from-blue-700 to-indigo-800 p-4 rounded-2xl mb-4">
                                        <User className="h-12 w-12 text-white" />
                                    </motion.div>
                                    <h2 className="text-2xl font-bold text-center text-gray-800">Crear Cuenta</h2>
                                    <p className="text-gray-600 mt-2">Regístrate para comenzar</p>
                                </div>
                                <form onSubmit={handleRequestCode} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-gray-700 font-medium flex items-center"><User className="h-4 w-4 mr-2 text-blue-600" />Nombre Completo</label>
                                        <input type="text" className="w-full py-3 px-4 text-gray-800 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Tu Nombre" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-gray-700 font-medium flex items-center"><Mail className="h-4 w-4 mr-2 text-blue-600" />Correo Electrónico</label>
                                        <input type="email" className="w-full py-3 px-4 text-gray-800 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="tu@email.com" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-gray-700 font-medium flex items-center"><Lock className="h-4 w-4 mr-2 text-blue-600" />Contraseña</label>
                                        <input type="password" className="w-full py-3 px-4 text-gray-800 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" />
                                    </div>
                                    {error && <p className="text-red-600 text-sm text-center">{error}</p>}
                                    <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-blue-700 to-indigo-800 text-white font-bold py-3 px-4 rounded-xl shadow-md flex items-center justify-center disabled:opacity-50">
                                        {isLoading ? 'Enviando...' : 'Solicitar Código'}
                                        {!isLoading && <ArrowRight className="h-5 w-5 ml-2" />}
                                    </motion.button>
                                </form>
                                <div className="mt-8 pt-6 border-t border-gray-200">
                                    <div className="text-center text-gray-600 text-sm">¿Ya tienes una cuenta?{' '}<Link href="/login" className="font-semibold text-blue-600 hover:text-blue-800">Inicia Sesión</Link></div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            transition={{ duration: 0.5 }}
                        >
                             <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 w-full">
                                <div className="flex flex-col items-center mb-8">
                                    <motion.div whileHover={{ rotate: 10, scale: 1.1 }} className="bg-gradient-to-r from-green-500 to-emerald-600 p-4 rounded-2xl mb-4">
                                        <ShieldCheck className="h-12 w-12 text-white" />
                                    </motion.div>
                                    <h2 className="text-2xl font-bold text-center text-gray-800">Verifica tu Cuenta</h2>
                                    <p className="text-gray-600 mt-2 text-center">Hemos enviado un código de 6 dígitos a <br/><strong>{email}</strong></p>
                                </div>
                                <form onSubmit={handleVerifyCode} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-gray-700 font-medium flex items-center"><Lock className="h-4 w-4 mr-2 text-green-600" />Código de Verificación</label>
                                        <input type="text" maxLength={6} className="w-full py-3 px-4 text-center tracking-[0.5em] text-2xl font-bold text-gray-800 bg-white border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500" value={verificationCode} onChange={(e) => setVerificationCode(e.target.value)} required placeholder="••••••" />
                                    </div>
                                    {error && <p className="text-red-600 text-sm text-center">{error}</p>}
                                    {success && <p className="text-green-600 text-sm text-center">{success}</p>}
                                    <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-3 px-4 rounded-xl shadow-md flex items-center justify-center disabled:opacity-50">
                                        {isLoading ? 'Verificando...' : 'Verificar y Registrar'}
                                        {!isLoading && <ArrowRight className="h-5 w-5 ml-2" />}
                                    </motion.button>
                                </form>
                             </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};

export default RegisterPage;
