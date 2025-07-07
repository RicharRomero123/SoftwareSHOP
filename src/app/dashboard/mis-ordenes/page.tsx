// my-client-app/src/app/dashboard/mis-ordenes/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Order, OrderStatus } from '@/types';
import orderService from '@/services/orderService';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Loader, CheckCircle, XCircle, Calendar, Info, Eye, Clipboard, ClipboardCheck, X } from 'lucide-react';

// --- INTERFAZ PARA ERRORES DE API ---
interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

// --- MODAL PARA DETALLES DE ENTREGA ---
const DeliveryDetailsModal = ({ order, onClose }: { order: Order | null; onClose: () => void }) => {
  const [copySuccess, setCopySuccess] = useState<string | null>(null);

  // Esta validación es clave. Si no hay orden o detalles, el modal no se renderiza.
  if (!order || !order.entrega) return null;
  
  // ✅ SOLUCIÓN: Creamos una referencia no nula a 'entrega'.
  // Después de la validación anterior, TypeScript sabe que 'order.entrega' existe.
  const entrega = order.entrega;

  const handleCopy = (text: string, field: string) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      setCopySuccess(field);
      setTimeout(() => setCopySuccess(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
    document.body.removeChild(textArea);
  };
  
  const allDetails = `Servicio: ${order.servicioNombre}\nCuenta: ${entrega.usuarioCuenta}\nClave: ${entrega.clave}${entrega.nota ? `\nNota: ${entrega.nota}`: ''}`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        className="bg-slate-800 border border-slate-700 rounded-2xl shadow-xl w-full max-w-lg p-6 text-white relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors">
          <X size={20} />
        </button>
        <div className="flex items-center mb-4">
            <div className="bg-blue-500/10 p-3 rounded-full border border-blue-500/30 mr-4">
                <Package className="text-blue-400" size={24} />
            </div>
            <div>
                <h2 className="text-xl font-bold">Detalles de Entrega</h2>
                <p className="text-sm text-slate-400">Orden #{order.id.substring(0, 8)} - {order.servicioNombre}</p>
            </div>
        </div>

        <div className="space-y-4 my-6">
            <div className="flex justify-between items-center bg-slate-900 p-3 rounded-lg">
                <div>
                    <span className="text-xs text-slate-400">Usuario/Cuenta</span>
                    <p className="font-mono text-white">{entrega.usuarioCuenta}</p>
                </div>
                {/* Ahora usamos la variable 'entrega' que ya no puede ser null */}
                <button onClick={() => handleCopy(entrega.usuarioCuenta, 'user')} className="p-2 rounded-md hover:bg-slate-700 transition-colors">
                    {copySuccess === 'user' ? <ClipboardCheck size={18} className="text-green-400"/> : <Clipboard size={18} className="text-slate-400"/>}
                </button>
            </div>
            <div className="flex justify-between items-center bg-slate-900 p-3 rounded-lg">
                <div>
                    <span className="text-xs text-slate-400">Contraseña/Clave</span>
                    <p className="font-mono text-white">{entrega.clave}</p>
                </div>
                 <button onClick={() => handleCopy(entrega.clave, 'pass')} className="p-2 rounded-md hover:bg-slate-700 transition-colors">
                    {copySuccess === 'pass' ? <ClipboardCheck size={18} className="text-green-400"/> : <Clipboard size={18} className="text-slate-400"/>}
                </button>
            </div>
            {entrega.nota && (
                 <div className="bg-slate-900 p-3 rounded-lg">
                    <span className="text-xs text-slate-400">Nota Adicional</span>
                    <p className="text-white text-sm mt-1">{entrega.nota}</p>
                </div>
            )}
        </div>
        
        <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => handleCopy(allDetails, 'all')}
            className="w-full bg-blue-600 hover:bg-blue-700 font-bold py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center"
        >
            {copySuccess === 'all' ? <><ClipboardCheck className="mr-2"/> Copiado</> : <><Clipboard className="mr-2"/> Copiar Todo</>}
        </motion.button>
      </motion.div>
    </motion.div>
  );
};


const MisOrdenesPage: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [activeFilter, setActiveFilter] = useState<OrderStatus | 'TODAS'>('TODAS');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    setIsClient(true); 

    if (!authLoading && user?.id) {
      const fetchClientOrders = async () => {
        try {
          const data = await orderService.getClientOrders(user.id);
          // Ordenar por fecha de creación (más reciente primero)
          const sortedData = data.sort((a, b) => new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime());
          setOrders(sortedData);
          setFilteredOrders(sortedData); // Inicialmente mostrar todas
        } catch (err: unknown) {
          console.error('Error al obtener órdenes del cliente:', err);
          const apiError = err as ApiError;
          const message = apiError.response?.data?.message || 'Error al cargar tus órdenes.';
          setError(message);
        } finally {
          setLoading(false);
        }
      };
      fetchClientOrders();
    }
  }, [user, authLoading]);

  useEffect(() => {
    if (activeFilter === 'TODAS') {
      setFilteredOrders(orders);
    } else {
      setFilteredOrders(orders.filter(order => order.estado === activeFilter));
    }
  }, [activeFilter, orders]);

  const getStatusInfo = (status: OrderStatus) => {
    switch (status) {
      case 'PENDIENTE': return { color: 'bg-blue-500/20 text-blue-300', icon: <Loader size={14} className="mr-1.5 animate-spin" /> };
      case 'PROCESANDO': return { color: 'bg-yellow-500/20 text-yellow-300', icon: <Package size={14} className="mr-1.5" /> };
      case 'COMPLETADO': return { color: 'bg-green-500/20 text-green-300', icon: <CheckCircle size={14} className="mr-1.5" /> };
      case 'CANCELADO': return { color: 'bg-red-500/20 text-red-300', icon: <XCircle size={14} className="mr-1.5" /> };
      default: return { color: 'bg-slate-600/50 text-slate-300', icon: <Info size={14} className="mr-1.5" /> };
    }
  };
  
  const filterOptions: (OrderStatus | 'TODAS')[] = ['TODAS', 'PENDIENTE', 'PROCESANDO', 'COMPLETADO', 'CANCELADO'];

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] bg-slate-900">
        <div className="text-center">
           <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
           <p className="text-lg text-slate-300">Cargando tus órdenes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 bg-red-500/10 border-red-500/30 text-red-300 rounded-lg shadow-lg">
        <strong className="font-bold">Error:</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4 sm:p-8">
      <AnimatePresence>
        {selectedOrder && <DeliveryDetailsModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />}
      </AnimatePresence>
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="text-4xl font-bold text-white mb-4">Mis Órdenes</h1>
            <p className="text-lg text-slate-400 mb-6">
              Aquí verás un listado de todas las órdenes que has realizado y su estado actual.
            </p>
        </motion.div>
        
        <div className="mb-6 flex flex-wrap gap-2">
            {filterOptions.map(filter => (
                <button 
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-colors duration-200 ${activeFilter === filter ? 'bg-blue-600 text-white' : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'}`}
                >
                    {filter.charAt(0) + filter.slice(1).toLowerCase()}
                </button>
            ))}
        </div>

        {filteredOrders.length === 0 ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-20 bg-slate-800/40 rounded-xl border border-slate-700">
            <Package size={48} className="mx-auto text-slate-500 mb-4" />
            <h3 className="text-xl font-semibold text-white">No hay órdenes con este filtro</h3>
            <p className="text-slate-400 mt-2">Prueba seleccionando otro estado o revisa más tarde.</p>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="overflow-x-auto rounded-xl shadow-lg border border-slate-700 bg-slate-800/40"
          >
            <table className="min-w-full divide-y divide-slate-700">
              <thead className="bg-slate-800">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">ID Orden</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Servicio</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Fecha Creación</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Fecha Entrega</th>
                  <th className="px-6 py-4 text-center text-xs font-medium text-slate-300 uppercase tracking-wider">Detalles</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {filteredOrders.map((order, index) => {
                  const statusInfo = getStatusInfo(order.estado);
                  return (
                    <motion.tr 
                      key={order.id} 
                      className="hover:bg-slate-800 transition-colors duration-200"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-slate-400">
                        #{order.id.substring(0, 8)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                        {order.servicioNombre}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex items-center text-xs leading-5 font-semibold rounded-full ${statusInfo.color}`}>
                          {statusInfo.icon}
                          {order.estado}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400 flex items-center">
                        <Calendar size={14} className="mr-2 text-slate-500"/>
                        {isClient ? new Date(order.fechaCreacion).toLocaleString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '...'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                        {isClient ? (order.fechaEntrega ? new Date(order.fechaEntrega).toLocaleString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : <span className="text-slate-500 italic">Aún no entregado</span>) : '...'}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-400 text-center">
                        {order.entrega ? (
                          <button onClick={() => setSelectedOrder(order)} className="bg-blue-600/20 text-blue-300 hover:bg-blue-600/40 px-3 py-1 rounded-full text-xs font-semibold flex items-center mx-auto">
                            <Eye size={14} className="mr-1.5"/>
                            Ver Detalles
                          </button>
                        ) : (
                          <span className="text-slate-500 italic text-xs">Sin detalles</span>
                        )}
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default MisOrdenesPage;