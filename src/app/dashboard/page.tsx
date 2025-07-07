// my-client-app/src/app/dashboard/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from "@/context/AuthContext";
import { ClientUser, Order } from "@/types";
import userService from "@/services/userService";
import orderService from "@/services/orderService";
import Link from 'next/link';

const DashboardHomePage: React.FC = () => {
    const { user, loading: authLoading } = useAuth();
    const [clientData, setClientData] = useState<ClientUser | null>(null);
    const [latestOrders, setLatestOrders] = useState<Order[]>([]);
    const [dataLoading, setDataLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!authLoading && user?.id) {
                setDataLoading(true);
                setError(null);
                try {
                    // Fetch user data
                    const userData = await userService.getUserById(user.id);
                    setClientData(userData);

                    // Fetch latest orders (e.g., last 3)
                    const ordersData = await orderService.getClientOrders(user.id);
                    setLatestOrders(ordersData.slice(0, 3));
                } catch (err: unknown) {
                    console.error('Error fetching dashboard data:', err);

                    if (
                        typeof err === 'object' &&
                        err !== null &&
                        'response' in err &&
                        typeof (err as { response?: { data?: { message?: string } } }).response?.data?.message === 'string'
                    ) {
                        setError((err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Error al cargar los datos del dashboard.');
                    } else if (err instanceof Error) {
                        setError(err.message);
                    } else {
                        setError('Error al cargar los datos del dashboard.');
                    }
                } finally {
                    setDataLoading(false);
                }
            }
        };

        fetchData();
    }, [user, authLoading]);

    if (authLoading || dataLoading) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-80px)] bg-gray-100">
                <p className="text-lg text-gray-700">Cargando datos del dashboard...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 bg-red-100 border border-red-400 text-red-700 rounded-lg shadow-lg">
                <strong className="font-bold">Error:</strong>
                <span className="block sm:inline"> {error}</span>
            </div>
        );
    }

    return (
        <div className="p-8 bg-white rounded-lg shadow-lg">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
                Bienvenido, {clientData?.nombre || 'Usuario'}!
            </h1>
            <p className="text-lg text-gray-600 mb-8">
                Aquí tienes un resumen de tu actividad.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                {/* Card for Monedas */}
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow-md flex flex-col justify-between h-40 transform hover:scale-105 transition-transform duration-200">
                    <div>
                        <h3 className="text-2xl font-semibold mb-2">Mis Monedas</h3>
                        <p className="text-sm">Saldo actual:</p>
                    </div>
                    <p className="font-bold text-5xl text-right">{clientData?.monedas || 0}</p>
                </div>

                {/* Card for Mis Órdenes */}
                <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-lg shadow-md flex flex-col justify-between h-40 transform hover:scale-105 transition-transform duration-200">
                    <div>
                        <h3 className="text-2xl font-semibold mb-2">Órdenes Recientes</h3>
                        <p className="text-sm">Últimas {latestOrders.length} órdenes:</p>
                    </div>
                    <ul className="text-sm list-disc list-inside mt-2">
                        {latestOrders.length > 0 ? (
                            latestOrders.map(order => (
                                <li key={order.id}>{order.servicioNombre} - <span className="font-semibold">{order.estado}</span></li>
                            ))
                        ) : (
                            <li>No hay órdenes recientes.</li>
                        )}
                    </ul>
                </div>

                {/* Card for Tienda */}
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-lg shadow-md flex flex-col justify-between h-40 transform hover:scale-105 transition-transform duration-200">
                    <div>
                        <h3 className="text-2xl font-semibold mb-2">Explorar Tienda</h3>
                        <p className="text-sm">Descubre nuevos servicios y productos.</p>
                    </div>
                    <Link href="/dashboard/servicios" className="mt-4 inline-block bg-white text-purple-600 font-bold py-2 px-4 rounded-md text-center hover:bg-gray-100 transition-colors">
                        Ir a la Tienda
                    </Link>
                </div>
            </div>

            <div className="mt-10 p-6 border-2 border-dashed border-gray-300 rounded-lg text-center text-gray-500">
                <p>Este es tu panel de control principal. Aquí encontrarás un resumen rápido y enlaces a las secciones importantes.</p>
            </div>
        </div>
    );
};

export default DashboardHomePage;
