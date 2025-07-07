// src/app/dashboard/page.tsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from "@/context/AuthContext";
import { ClientUser, Order, OrderStatus, Service } from "@/types";
import userService from "@/services/userService";
import orderService from "@/services/orderService";
import serviceService from "@/services/serviceService";
import Link from 'next/link';
import Image from 'next/image'; // ✅ SOLUCIÓN: Importar Image de Next.js
import { motion, AnimatePresence } from 'framer-motion';
// ✅ SOLUCIÓN: Se eliminaron los iconos no utilizados
import { 
    Coins, Package, CheckCircle, ArrowRight, Loader, Check, X, 
    PlusCircle, TrendingDown, Star, MessageSquare, Tv, Music, Gamepad2
} from 'lucide-react';

// --- Helper Components ---

const StatCard = ({ icon, title, value, unit, delay }: { icon: React.ReactNode, title: string, value: string | number, unit?: string, delay: number }) => (
    <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5, delay }} 
        className="bg-slate-800/50 border border-slate-700 rounded-xl p-4"
    >
        <div className="flex items-center gap-4">
            <div className="p-2 bg-slate-700/50 rounded-lg">{icon}</div>
            <div>
                <p className="text-slate-400 text-xs font-medium">{title}</p>
                <p className="text-lg font-bold text-white">{value} <span className="text-sm font-medium text-slate-300">{unit}</span></p>
            </div>
        </div>
    </motion.div>
);

const BalanceScoreMeter = ({ balance = 0, spent = 0 }) => {
    const totalPotential = balance + spent;
    const percentage = totalPotential > 0 ? (balance / totalPotential) * 100 : 100;
    const radius = 90;
    const circumference = Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
        <div className="relative w-full flex flex-col items-center">
            <svg className="w-full" viewBox="0 0 200 110">
                <path
                    d="M 10 100 A 90 90 0 0 1 190 100"
                    strokeWidth="20"
                    fill="none"
                    className="text-slate-700"
                    strokeLinecap="round"
                />
                <motion.path
                    d="M 10 100 A 90 90 0 0 1 190 100"
                    strokeWidth="20"
                    fill="none"
                    className="text-amber-400"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset }}
                    transition={{ duration: 1.2, delay: 0.5, ease: "circOut" }}
                />
            </svg>
            <div className="absolute top-1/2 -translate-y-1/4 flex flex-col items-center">
                <span className="text-4xl font-bold text-white">{balance}</span>
                <span className="text-sm text-slate-400 -mt-1">Monedas</span>
            </div>
            <div className="w-full flex justify-between text-xs text-slate-400 mt-1 px-2">
                <span>Gastado: {spent}</span>
                <span>Total: {totalPotential}</span>
            </div>
        </div>
    );
};

const RechargeModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
    const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
    const rechargeOptions = [ { amount: 5, bonus: 0 }, { amount: 10, bonus: 0 }, { amount: 15, bonus: 0 }, { amount: 20, bonus: 2 }, { amount: 50, bonus: 3 }, { amount: 100, bonus: 5 }, ];

    const selectedOption = selectedAmount ? rechargeOptions.find(opt => opt.amount === selectedAmount) : null;
    const bonusCoins = selectedAmount && selectedOption ? Math.round(selectedAmount * selectedOption.bonus / 100) : 0;
    const totalToReceive = selectedAmount ? selectedAmount + bonusCoins : 0;
    const message = selectedAmount ? `¡Hola! Quiero realizar una orden de recarga por S/ ${selectedAmount}.00 PEN para recibir un total de ${totalToReceive} monedas (incluye ${bonusCoins} monedas de bonus). Adjunto mi comprobante de Yape para la validación.` : '';
    const whatsappUrl = selectedAmount ? `https://wa.me/51932276267?text=${encodeURIComponent(message)}` : '#';

    if (!isOpen) return null;

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-slate-800 border border-slate-700 rounded-2xl shadow-xl w-full max-w-2xl p-6 text-white relative" onClick={(e) => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"><X size={20} /></button>
                <h2 className="text-2xl font-bold mb-4">Añadir Saldo</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <p className="text-slate-400 mb-4">Selecciona un monto para recargar (1 Moneda = 1 PEN).</p>
                        <div className="grid grid-cols-3 gap-3">
                            {rechargeOptions.map(option => (
                                <button key={option.amount} onClick={() => setSelectedAmount(option.amount)} className={`relative p-3 rounded-lg text-center transition-all duration-200 ${selectedAmount === option.amount ? 'bg-blue-600 text-white scale-105 shadow-lg' : 'bg-slate-700 hover:bg-slate-600'}`}>
                                    <p className="font-bold text-lg">{option.amount}</p>
                                    <p className="text-xs text-slate-300">Monedas</p>
                                    {option.bonus > 0 && <span className="absolute -top-2 -right-2 bg-amber-400 text-black text-xs font-bold px-1.5 py-0.5 rounded-full">+{option.bonus}%</span>}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="bg-slate-900/50 p-4 rounded-lg flex flex-col items-center justify-center">
                        <p className="font-semibold mb-2">Escanea para pagar con Yape</p>
                        {/* ✅ SOLUCIÓN: Se reemplazó <img> por <Image> */}
                        <Image src="https://res.cloudinary.com/dod56svuf/image/upload/v1751870405/WhatsApp_Image_2025-07-06_at_6.34.11_PM_jejyh9.jpg" alt="QR Code Yape" width={192} height={192} className="rounded-lg"/>
                        <div className="mt-4 text-xs text-center text-slate-400 bg-slate-800 p-2 rounded-md">
                            {/* ✅ SOLUCIÓN: Comillas escapadas con &quot; */}
                            <p>Una vez realizado el pago, haz clic en &quot;Notificar por WhatsApp&quot; y **adjunta la captura** de tu comprobante en el chat.</p>
                        </div>
                    </div>
                </div>
                <div className="mt-6 border-t border-slate-700 pt-4">
                    <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => { if (!selectedAmount) e.preventDefault(); }} className={`w-full flex items-center justify-center gap-2 font-semibold px-6 py-3 rounded-lg transition-colors shadow-lg ${!selectedAmount ? 'bg-slate-600 text-slate-400 cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-700 shadow-green-600/20'}`}>
                        <MessageSquare size={20}/>
                        Notificar por WhatsApp
                    </a>
                </div>
            </motion.div>
        </motion.div>
    );
};

// --- Main Component ---

const DashboardHomePage: React.FC = () => {
    const { user, loading: authLoading } = useAuth();
    const [clientData, setClientData] = useState<ClientUser | null>(null);
    const [orders, setOrders] = useState<Order[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [dataLoading, setDataLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isClient, setIsClient] = useState(false);
    const [isRechargeModalOpen, setIsRechargeModalOpen] = useState(false);

    useEffect(() => {
        setIsClient(true);
        const fetchData = async () => {
            if (!authLoading && user?.id) {
                setDataLoading(true);
                setError(null);
                try {
                    const [userData, ordersData, servicesData] = await Promise.all([
                        userService.getUserById(user.id),
                        orderService.getClientOrders(user.id),
                        serviceService.getAllServices()
                    ]);
                    setClientData(userData);
                    setServices(servicesData);
                    const sortedOrders = ordersData.sort((a, b) => new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime());
                    setOrders(sortedOrders);
                } catch (err: unknown) {
                    console.error('Error fetching dashboard data:', err);
                    if (err && typeof err === 'object' && 'response' in err) {
                        const axiosErr = err as { response?: { data?: { message?: string } } };
                        setError(axiosErr.response?.data?.message || 'Error al cargar los datos del dashboard.');
                    } else {
                        setError('Ocurrió un error inesperado al cargar los datos.');
                    }
                } finally {
                    setDataLoading(false);
                }
            }
        };
        fetchData();
    }, [user, authLoading]);

    const stats = useMemo(() => {
        const servicePriceMap = new Map<string, number>();
        services.forEach(service => { servicePriceMap.set(service.id, service.precioMonedas); });
        const monthlyExpenses = orders.filter(o => new Date(o.fechaCreacion).getMonth() === new Date().getMonth()).reduce((acc, order) => acc + (servicePriceMap.get(order.servicioId) || 0), 0);
        const totalExpenses = orders.reduce((acc, order) => acc + (servicePriceMap.get(order.servicioId) || 0), 0);
        const serviceCounts = orders.reduce((acc, order) => {
            acc[order.servicioNombre] = (acc[order.servicioNombre] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        const favoriteService = Object.keys(serviceCounts).reduce((a, b) => serviceCounts[a] > serviceCounts[b] ? a : b, 'Ninguno');
        const popularServices = Object.entries(serviceCounts).sort(([,a],[,b]) => b-a).slice(0, 3).map(([name]) => services.find(s => s.nombre === name)).filter(Boolean) as Service[];
        return { totalOrders: orders.length, monthlyExpenses, totalExpenses, favoriteService, popularServices };
    }, [orders, services]);

    const latestOrders = orders.slice(0, 4);
    
    const getStatusIcon = (status: OrderStatus) => {
        switch(status) {
            case 'COMPLETADO': return <CheckCircle className="w-5 h-5 text-green-400"/>;
            case 'PROCESANDO': return <Loader className="w-5 h-5 text-yellow-400 animate-spin"/>;
            case 'PENDIENTE': return <Loader className="w-5 h-5 text-blue-400 animate-spin"/>;
            case 'CANCELADO': return <X className="w-5 h-5 text-red-400"/>;
            default: return <Check className="w-5 h-5 text-slate-500"/>;
        }
    };
    
    const getServiceIcon = (serviceName: string) => {
        if (serviceName.toLowerCase().includes('netflix')) return <Tv className="w-6 h-6 text-red-500"/>;
        if (serviceName.toLowerCase().includes('spotify')) return <Music className="w-6 h-6 text-green-500"/>;
        if (serviceName.toLowerCase().includes('juegos')) return <Gamepad2 className="w-6 h-6 text-indigo-500"/>;
        return <Package className="w-6 h-6 text-slate-500"/>;
    }

    if (authLoading || dataLoading) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-80px)] bg-slate-900">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-lg text-slate-300">Cargando tu dashboard...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 bg-red-500/10 text-red-300 rounded-lg shadow-lg max-w-2xl mx-auto mt-10">
                <strong className="font-bold">Error:</strong>
                <span className="block sm:inline ml-2">{error}</span>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-900 text-white relative overflow-hidden">
            <AnimatePresence>
                {isRechargeModalOpen && <RechargeModal isOpen={isRechargeModalOpen} onClose={() => setIsRechargeModalOpen(false)} />}
            </AnimatePresence>
            <div className="absolute inset-0 bg-gradient-radial from-blue-900/10 via-slate-900 to-slate-900"></div>
            
            <div className="max-w-screen-2xl mx-auto relative z-10 p-4 sm:p-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    <main className="lg:col-span-8 space-y-8">
                        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                                <div>
                                    <h1 className="text-4xl font-bold text-white mb-2">Hola, {clientData?.nombre.split(' ')[0]} 👋</h1>
                                    <p className="text-lg text-slate-400">Aquí tienes un resumen de tu actividad.</p>
                                </div>
                                <button onClick={() => setIsRechargeModalOpen(true)} className="mt-4 sm:mt-0 flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20">
                                    <PlusCircle size={20}/>
                                    Añadir Saldo
                                </button>
                            </div>
                        </motion.div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <StatCard icon={<Package className="w-7 h-7 text-blue-400"/>} title="Órdenes Totales" value={stats.totalOrders} delay={0.2}/>
                            <StatCard icon={<TrendingDown className="w-7 h-7 text-red-400"/>} title="Gasto Total" value={stats.totalExpenses} unit="Monedas" delay={0.3}/>
                            <StatCard icon={<Star className="w-7 h-7 text-yellow-400"/>} title="Servicio Favorito" value={stats.favoriteService} delay={0.4}/>
                        </div>

                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }}>
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold text-white">Actividad Reciente</h2>
                                <Link href="/dashboard/mis-ordenes" className="text-sm font-semibold text-blue-400 hover:underline flex items-center gap-1">
                                    Ver todo <ArrowRight size={16}/>
                                </Link>
                            </div>
                            <div className="space-y-3">
                                {latestOrders.length > 0 ? latestOrders.map(order => {
                                    const price = services.find(s => s.id === order.servicioId)?.precioMonedas || 0;
                                    return (
                                        <div key={order.id} className="flex items-center justify-between p-3 bg-slate-800/50 border border-slate-700 rounded-lg hover:bg-slate-800 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="p-2 bg-slate-700/50 rounded-md">{getStatusIcon(order.estado)}</div>
                                                <div>
                                                    <p className="font-semibold text-white">{order.servicioNombre}</p>
                                                    <p className="text-xs text-slate-400">
                                                        {isClient ? new Date(order.fechaCreacion).toLocaleDateString('es-PE', { day: 'numeric', month: 'long' }) : '...'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-red-400">-{price}</p>
                                                <p className="text-xs text-slate-500">Monedas</p>
                                            </div>
                                        </div>
                                    )
                                }) : (
                                    <div className="text-center py-10 bg-slate-800/50 rounded-lg">
                                        <p className="text-slate-400">No tienes actividad reciente.</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </main>

                    <aside className="lg:col-span-4 space-y-8">
                         <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 flex flex-col items-center">
                            <h2 className="text-xl font-bold text-white mb-4">Resumen de Saldo</h2>
                            <BalanceScoreMeter balance={clientData?.monedas || 0} spent={stats.monthlyExpenses} />
                         </motion.div>
                         <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.6 }}>
                            <h2 className="text-xl font-bold text-white mb-4">Servicios Populares</h2>
                             <div className="space-y-3">
                                {stats.popularServices.length > 0 ? stats.popularServices.map(service => (
                                    <Link key={service.id} href="/dashboard/servicios" className="group flex items-center gap-4 p-3 rounded-lg hover:bg-slate-800 transition-colors bg-slate-800/50 border border-slate-700">
                                        <div className="p-2 bg-slate-700/50 rounded-md">{getServiceIcon(service.nombre)}</div>
                                        <div>
                                            <p className="font-semibold text-white">{service.nombre}</p>
                                            <p className="text-xs text-slate-400">{service.precioMonedas} Monedas</p>
                                        </div>
                                        <ArrowRight className="w-5 h-5 text-slate-500 ml-auto transition-transform group-hover:translate-x-1"/>
                                    </Link>
                                )) : (
                                    <p className="text-center text-slate-400 py-4">No hay servicios populares aún.</p>
                                )}
                             </div>
                        </motion.div>
                    </aside>
                </div>
            </div>
        </div>
    );
};

export default DashboardHomePage;