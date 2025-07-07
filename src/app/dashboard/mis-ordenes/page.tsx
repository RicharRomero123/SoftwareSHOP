// my-client-app/src/app/dashboard/mis-ordenes/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Order, OrderStatus } from '@/types';
import orderService from '@/services/orderService';

const MisOrdenesPage: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && user?.id) {
      const fetchClientOrders = async () => {
        try {
          const data = await orderService.getClientOrders(user.id);
          setOrders(data);
        } catch (err: any) {
          console.error('Error al obtener órdenes del cliente:', err);
          setError(err.response?.data?.message || 'Error al cargar tus órdenes.');
        } finally {
          setLoading(false);
        }
      };
      fetchClientOrders();
    }
  }, [user, authLoading]);

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'PENDIENTE':
        return 'bg-blue-100 text-blue-800';
      case 'PROCESANDO':
        return 'bg-yellow-100 text-yellow-800';
      case 'COMPLETADO':
        return 'bg-green-100 text-green-800';
      case 'CANCELADO':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] bg-gray-100">
        <p className="text-lg text-gray-700">Cargando tus órdenes...</p>
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
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Mis Órdenes</h1>
      <p className="text-lg text-gray-600 mb-8">
        Aquí verás un listado de todas las órdenes que has realizado.
      </p>

      {orders.length === 0 ? (
        <div className="text-center py-10 text-gray-500 text-lg">
          No tienes órdenes registradas.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg shadow-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID Orden
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Servicio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha Creación
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha Entrega
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Detalles Entrega
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {order.id.substring(0, 8)}...
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {order.servicioNombre}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.estado)}`}>
                      {order.estado}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {new Date(order.fechaCreacion).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {order.fechaEntrega ? new Date(order.fechaEntrega).toLocaleString() : 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {order.entrega ? (
                      <div className="text-xs space-y-1">
                        <p><span className="font-semibold">Cuenta:</span> {order.entrega.usuarioCuenta}</p>
                        <p><span className="font-semibold">Clave:</span> {order.entrega.clave}</p>
                        {order.entrega.nota && <p><span className="font-semibold">Nota:</span> {order.entrega.nota}</p>}
                      </div>
                    ) : (
                      'N/A'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MisOrdenesPage;
