// my-client-app/src/app/dashboard/servicios/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Service } from '@/types';
import serviceService from '@/services/serviceService';
import orderService from '@/services/orderService';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Clock, AlertTriangle, X, Coins } from 'lucide-react';

// --- INTERFAZ PARA ERRORES DE API ---
interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

// --- COMPONENTE DEL MODAL DE CONFIRMACIÓN ---
const ConfirmationModal = ({ service, onConfirm, onCancel }: { service: Service | null, onConfirm: () => void, onCancel: () => void }) => {
  if (!service) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-slate-800 border border-slate-700 rounded-2xl shadow-xl w-full max-w-md p-6 text-white relative"
        onClick={(e) => e.stopPropagation()} // Evita que el clic dentro del modal lo cierre
      >
        <button onClick={onCancel} className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors">
          <X size={20} />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="bg-blue-500/10 p-3 rounded-full border border-blue-500/30 mb-4">
            <ShoppingCart className="text-blue-400" size={28} />
          </div>
          <h2 className="text-2xl font-bold mb-2">Confirmar Compra</h2>
          <p className="text-slate-300 mb-4">
            ¿Estás seguro de que deseas comprar el servicio <strong className="text-blue-400">{service.nombre}</strong> por <strong className="text-amber-400">{service.precioMonedas} Monedas</strong>?
          </p>
          
          <div className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 text-xs p-3 rounded-lg flex items-start gap-2 w-full mb-6">
            <AlertTriangle size={24} className="flex-shrink-0 mt-0.5" />
            <p>
              Una vez confirmada la compra, se iniciará el proceso de entrega. Por favor, ten en cuenta que este servicio tiene un tiempo de espera estimado de <strong className="font-bold">{service.tiempoEsperaMinutos} minutos</strong>.
            </p>
          </div>

          <div className="flex justify-center gap-4 w-full">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onCancel}
              className="w-full bg-slate-700 hover:bg-slate-600 font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              Cancelar
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onConfirm}
              className="w-full bg-blue-600 hover:bg-blue-700 font-bold py-2 px-4 rounded-lg transition-colors"
            >
              Aceptar y Comprar
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};


const ServiciosPage: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [purchaseMessage, setPurchaseMessage] = useState<string | null>(null);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);
  const [purchasingServiceId, setPurchasingServiceId] = useState<string | null>(null);
  
  // Estados para el modal
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await serviceService.getAllServices();
        setServices(data);
      } catch (err: unknown) {
        console.error('Error al obtener servicios:', err);
        const error = err as ApiError;
        setError(error.response?.data?.message || 'Error al cargar los servicios disponibles.');
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  // Abre el modal de confirmación
  const handlePurchaseClick = (service: Service) => {
    setSelectedService(service);
    setShowConfirmation(true);
  };

  // Ejecuta la compra después de la confirmación
  const confirmPurchase = async () => {
    if (!selectedService) return;

    if (authLoading || !user?.id) {
      setPurchaseError('No se pudo procesar la compra: Usuario no autenticado.');
      setShowConfirmation(false);
      return;
    }

    setPurchasingServiceId(selectedService.id);
    setShowConfirmation(false);
    setPurchaseMessage(null);
    setPurchaseError(null);

    try {
      const newOrder = await orderService.createOrder(user.id, selectedService.id);
      setPurchaseMessage(`¡Compra realizada! Tu orden #${newOrder.id.substring(0, 8)}... está ${newOrder.estado}.`);
    } catch (err: unknown) {
      console.error('Error al comprar servicio:', err);
      const error = err as ApiError;
      setPurchaseError(error.response?.data?.message || 'Error al procesar la compra. Verifica tus monedas.');
    } finally {
      setPurchasingServiceId(null);
      setSelectedService(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4 sm:p-8">
      <AnimatePresence>
        {showConfirmation && (
          <ConfirmationModal
            service={selectedService}
            onConfirm={confirmPurchase}
            onCancel={() => setShowConfirmation(false)}
          />
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-4xl font-bold text-white mb-4">Tienda de Servicios</h1>
          <p className="text-lg text-slate-400 mb-10">
            Explora y adquiere los servicios disponibles para potenciar tu experiencia.
          </p>
        </motion.div>

        {purchaseMessage && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-green-500/10 border border-green-500/30 text-green-300 px-4 py-3 rounded-lg relative mb-6" role="alert">
            <strong className="font-bold">Éxito: </strong>
            <span className="block sm:inline">{purchaseMessage}</span>
          </motion.div>
        )}

        {purchaseError && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-3 rounded-lg relative mb-6" role="alert">
            <strong className="font-bold">Error en la compra: </strong>
            <span className="block sm:inline">{purchaseError}</span>
          </motion.div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-20">
             <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-3 rounded-lg text-center" role="alert">
            <strong className="font-bold">Error: </strong> {error}
          </div>
        ) : services.length === 0 ? (
          <div className="text-center py-20 text-slate-500 text-lg">
            No hay servicios disponibles en este momento.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {services.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="bg-slate-800/50 border border-slate-700 rounded-xl shadow-lg p-6 flex flex-col justify-between transition-all duration-300 hover:border-blue-500 hover:bg-slate-800 hover:-translate-y-1"
              >
                <div>
                  <h3 className="text-xl font-bold text-white mb-3">{service.nombre}</h3>
                  <p className="text-slate-400 text-sm mb-5 h-20 overflow-hidden">{service.descripcion}</p>
                  
                  <div className="space-y-3 text-sm mb-6">
                    <div className="flex items-center gap-2 text-amber-400">
                      <Coins size={16} />
                      <span className="font-semibold">{service.precioMonedas} Monedas</span>
                    </div>
                    <div className="flex items-center gap-2 text-cyan-400">
                      <Clock size={16} />
                      <span>Espera: {service.tiempoEsperaMinutos} min</span>
                    </div>
                     <div className={`flex items-center gap-2 text-xs font-semibold`}>
                        <span className={`px-2 py-1 rounded-full ${service.requiereEntrega ? 'bg-yellow-500/20 text-yellow-300' : 'bg-green-500/20 text-green-300'}`}>
                          {service.requiereEntrega ? 'Requiere Entrega' : 'Activación Digital'}
                        </span>
                    </div>
                  </div>
                </div>
                <motion.button
                  onClick={() => handlePurchaseClick(service)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-lg transition-colors duration-300 disabled:bg-slate-700 disabled:text-slate-400 disabled:cursor-not-allowed"
                  disabled={purchasingServiceId === service.id || !service.activo}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {purchasingServiceId === service.id ? 'Procesando...' : service.activo ? 'Comprar Ahora' : 'No disponible'}
                </motion.button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiciosPage;