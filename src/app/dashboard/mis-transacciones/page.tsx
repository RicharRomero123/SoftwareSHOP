// my-client-app/src/app/dashboard/mis-transacciones/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from "@/context/AuthContext";
import { Transaction, TransactionType } from "@/types";
import transactionService from "@/services/transactionService";
import { Shield, FileText, Mail, ArrowDown, ArrowUp, Wallet } from 'lucide-react';
import { motion } from 'framer-motion';

const MisTransaccionesPage: React.FC = () => {
    const { user, loading: authLoading } = useAuth();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Función para cargar las transacciones del cliente
    const fetchClientTransactions = async () => {
        if (!user?.id) return;

        setLoading(true);
        setError(null);
        try {
            const data = await transactionService.getClientTransactions(user.id);
            setTransactions(data);
        } catch (err: any) {
            console.error('Error al obtener transacciones del cliente:', err);
            setError(err.response?.data?.message || 'Error al cargar tus transacciones.');
        } finally {
            setLoading(false);
        }
    };

    // Efecto para cargar las transacciones al montar el componente
    useEffect(() => {
        if (!authLoading && user?.id) {
            fetchClientTransactions();
        }
    }, [user, authLoading]);

    // Función para obtener el color del tipo de transacción
    const getTypeColor = (type: TransactionType) => {
        switch (type) {
            case 'RECARGA':
                return 'bg-green-200 text-green-900';
            case 'GASTO':
                return 'bg-red-200 text-red-900';
            default:
                return 'bg-gray-200 text-gray-900';
        }
    };

    // Función para obtener el ícono del tipo de transacción
    const getTypeIcon = (type: TransactionType) => {
        switch (type) {
            case 'RECARGA':
                return <ArrowDown className="h-4 w-4 text-green-800 mr-1" />;
            case 'GASTO':
                return <ArrowUp className="h-4 w-4 text-red-800 mr-1" />;
            default:
                return <Wallet className="h-4 w-4 text-gray-800 mr-1" />;
        }
    };

    if (authLoading || loading) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-80px)] bg-slate-900">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-lg text-slate-300">Cargando tus transacciones...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-6xl mx-auto px-4 py-10">
                <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg shadow-lg">
                    <strong className="font-bold">Error:</strong>
                    <span className="block sm:inline"> {error}</span>
                </div>
            </div>
        );
    }

    // Información para las cards
    const infoCards = [
        {
            id: 1,
            title: "Seguridad",
            description: "No compartas tus datos. Usa contraseñas seguras.",
            icon: <Shield className="h-5 w-5 text-blue-400" />
        },
        {
            id: 2,
            title: "Políticas",
            description: "Revisa nuestras políticas de pagos y devoluciones.",
            icon: <FileText className="h-5 w-5 text-green-400" />
        },
        {
            id: 3,
            title: "Soporte",
            description: "¿Tienes un reclamo? Contáctanos aquí.",
            icon: <Mail className="h-5 w-5 text-purple-400" />
        }
    ];

    return (
        <div className="min-h-[calc(100vh-80px)] bg-slate-900 text-white py-10">
            <div className="max-w-6xl mx-auto px-4">
                {/* Encabezado con cards alineadas horizontalmente */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                    <div>
                        <motion.h1
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className="text-3xl font-bold text-white mb-2"
                        >
                            Mis Transacciones
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.1 }}
                            className="text-lg text-slate-300"
                        >
                            Historial completo de tus movimientos financieros
                        </motion.p>
                    </div>

                    <motion.div
                        className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full md:w-auto"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.2 }}
                    >
                        {infoCards.map((card) => (
                            <motion.div
                                key={card.id}
                                whileHover={{ scale: 1.03 }}
                                className="bg-slate-800/40 backdrop-blur-sm rounded-xl p-4 border border-slate-700 shadow-md"
                            >
                                <div className="flex items-start mb-2">
                                    <div className="mr-2 mt-0.5">
                                        {card.icon}
                                    </div>
                                    <h3 className="text-sm font-semibold text-slate-100">{card.title}</h3>
                                </div>
                                <p className="text-xs text-slate-300">{card.description}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>

                {/* Tabla de transacciones */}
                {transactions.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                        className="bg-slate-800/40 backdrop-blur-sm rounded-xl p-8 text-center border border-slate-700 shadow-md"
                    >
                        <div className="bg-blue-900/20 p-4 rounded-full inline-block mb-4">
                            <Wallet className="h-10 w-10 text-blue-400 mx-auto" />
                        </div>
                        <h3 className="text-xl font-medium text-white mb-2">No tienes transacciones registradas</h3>
                        <p className="text-slate-300 max-w-md mx-auto">
                            Todavía no has realizado ninguna transacción en SISTEMASVIP.SHOP
                        </p>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.3 }}
                        className="overflow-x-auto rounded-xl shadow-lg border border-slate-700"
                    >
                        <table className="min-w-full divide-y divide-slate-700">
                            <thead className="bg-slate-800">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                                    ID Transacción
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                                    Tipo
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-slate-300 uppercase tracking-wider">
                                    Cantidad
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                                    Descripción
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                                    Fecha
                                </th>
                            </tr>
                            </thead>
                            <tbody className="bg-slate-900 divide-y divide-slate-700">
                            {transactions.map((transaction, index) => (
                                <tr
                                    key={transaction.id}
                                    className={`hover:bg-slate-800/60 transition-colors duration-200 ${index % 2 === 0 ? 'bg-slate-900' : 'bg-slate-900/50'}`}
                                >
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-200">
                                        {transaction.id.substring(0, 8)}...
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            {getTypeIcon(transaction.tipo)}
                                            <span
                                                className={`px-2.5 py-1 text-xs font-semibold rounded-full ${getTypeColor(transaction.tipo)}`}>
                                                    {transaction.tipo}
                                                </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-200 text-right flex items-center justify-end gap-1">
                                        <Wallet className="h-4 w-4 text-yellow-400"/>
                                        <span className="text-slate-100">{transaction.cantidad}</span>
                                        <span className="text-amber-600 font-semibold">IntiCoin</span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-300 max-w-xs overflow-hidden text-ellipsis">
                                        {transaction.descripcion}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                                        {new Date(transaction.fecha).toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default MisTransaccionesPage;