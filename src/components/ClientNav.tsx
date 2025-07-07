// my-client-app/src/components/ClientNav.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from "@/context/AuthContext";
import userService from "@/services/userService";
import {
    Home, ShoppingCart, Package, CreditCard, User as UserIcon,
    LogOut, Menu, X, Coins
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ClientNav: React.FC = () => {
    const pathname = usePathname();
    const router = useRouter();
    const { user, loading: authLoading, logout } = useAuth();
    const [userCoins, setUserCoins] = useState<number | null>(null);
    const [loadingCoins, setLoadingCoins] = useState<boolean>(true);
    const [coinsError, setCoinsError] = useState<string | null>(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const fetchUserCoins = useCallback(async () => {
        if (user?.id) {
            setLoadingCoins(true);
            setCoinsError(null);
            try {
                const userData = await userService.getUserById(user.id);
                setUserCoins(userData.monedas);
            } catch (err: unknown) { 
                console.error('Error al obtener monedas del usuario:', err);
                // La lógica interna ya es segura, solo se necesitaba cambiar el tipo del error.
                setCoinsError('Error al cargar monedas.');
                setUserCoins(null);
            } finally {
                setLoadingCoins(false);
            }
        } else if (!authLoading) {
            setUserCoins(null);
            setLoadingCoins(false);
        }
    }, [user?.id, authLoading]);

    useEffect(() => {
        fetchUserCoins();
    }, [fetchUserCoins]);

    const navItems = [
        { name: 'Inicio', href: '/dashboard', icon: Home },
        { name: 'Tienda', href: '/dashboard/servicios', icon: ShoppingCart },
        { name: 'Mis Órdenes', href: '/dashboard/mis-ordenes', icon: Package },
        { name: 'Mis Transacciones', href: '/dashboard/mis-transacciones', icon: CreditCard },
        { name: 'Mi Perfil', href: '/dashboard/mi-perfil', icon: UserIcon },
    ];

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    return (
        <nav className="bg-slate-900 text-white shadow-lg fixed w-full top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    {/* Logo y menú móvil */}
                    <div className="flex items-center">
                        <Link
                            href="/dashboard"
                            className="flex items-center text-xl font-bold tracking-tighter"
                        >
                            <span className="bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">
                                SISTEMASVIP.SHOP
                            </span>
                        </Link>

                        {/* Menú desktop - oculto en móvil */}
                        <div className="hidden md:flex ml-10">
                            <div className="flex space-x-1">
                                {navItems.map((item) => {
                                    const Icon = item.icon;
                                    const isActive = pathname === item.href;

                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className={`
                                                flex items-center px-3 py-2 rounded-md text-sm font-medium
                                                transition-colors duration-200
                                                ${isActive
                                                ? 'bg-slate-800 text-blue-400'
                                                : 'text-gray-300 hover:text-white hover:bg-slate-800'
                                                }
                                            `}
                                        >
                                            <Icon className="h-4 w-4 mr-2" />
                                            {item.name}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Sección usuario y botones */}
                    <div className="flex items-center space-x-4">
                        {user && (
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                className="hidden md:flex items-center bg-slate-800 px-4 py-2 rounded-full"
                            >
                                <span className="text-gray-300 text-sm font-medium mr-2 truncate max-w-[120px]">
                                    {user.nombre}
                                </span>

                                <div className="flex items-center space-x-1">
                                    <Coins className="h-4 w-4 text-amber-400" />
                                    {loadingCoins ? (
                                        <span className="text-gray-400 text-xs">Cargando...</span>
                                    ) : coinsError ? (
                                        <span className="text-red-400 text-xs">Error</span>
                                    ) : (
                                        <span className="text-amber-400 font-medium text-sm">
                                            {userCoins !== null ? userCoins : 'N/A'}
                                        </span>
                                    )}
                                </div>
                            </motion.div>
                        )}

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleLogout}
                            className="hidden md:flex items-center bg-slate-800 hover:bg-red-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors duration-300"
                        >
                            <LogOut className="h-4 w-4 mr-1" />
                            <span>Cerrar Sesión</span>
                        </motion.button>

                        {/* Botón menú móvil */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="md:hidden text-gray-300 hover:text-white focus:outline-none"
                        >
                            {isMenuOpen ? (
                                <X className="h-6 w-6" />
                            ) : (
                                <Menu className="h-6 w-6" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Menú móvil */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-slate-800 border-t border-slate-700"
                    >
                        <div className="px-2 pt-2 pb-3 space-y-1">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = pathname === item.href;

                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`
                                            flex items-center px-3 py-2 rounded-md text-base font-medium
                                            transition-colors duration-200
                                            ${isActive
                                            ? 'bg-slate-700 text-blue-400'
                                            : 'text-gray-300 hover:text-white hover:bg-slate-700'
                                        }
                                        `}
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        <Icon className="h-5 w-5 mr-3" />
                                        {item.name}
                                    </Link>
                                );
                            })}

                            {user && (
                                <div className="flex items-center justify-between px-3 py-2 mt-4 border-t border-slate-700 pt-4">
                                    <div className="flex items-center">
                                        <UserIcon className="h-5 w-5 text-gray-400 mr-2" />
                                        <span className="text-gray-300 text-sm font-medium truncate max-w-[140px]">
                                            {user.nombre}
                                        </span>
                                    </div>

                                    <div className="flex items-center space-x-1">
                                        <Coins className="h-4 w-4 text-amber-400" />
                                        {loadingCoins ? (
                                            <span className="text-gray-400 text-xs">...</span>
                                        ) : coinsError ? (
                                            <span className="text-red-400 text-xs">Err</span>
                                        ) : (
                                            <span className="text-amber-400 font-medium text-sm">
                                                {userCoins !== null ? userCoins : 'N/A'}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}

                            <button
                                onClick={() => {
                                    handleLogout();
                                    setIsMenuOpen(false);
                                }}
                                className="w-full flex items-center justify-center mt-2 bg-slate-700 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-300"
                            >
                                <LogOut className="h-5 w-5 mr-2" />
                                Cerrar Sesión
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default ClientNav;