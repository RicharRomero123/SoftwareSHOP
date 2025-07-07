// my-client-app/src/app/dashboard/servicios/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Service } from '@/types';
import serviceService from '@/services/serviceService';
import orderService from '@/services/orderService';

// --- INTERFAZ PARA ERRORES DE API ---
// Es una buena práctica definir la forma que esperas que tengan los errores.
interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

const ServiciosPage: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [purchaseMessage, setPurchaseMessage] = useState<string | null>(null);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);
  const [purchasingServiceId, setPurchasingServiceId] = useState<string | null>(null);

  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await serviceService.getAllServices();
        setServices(data);
      } catch (err: unknown) { // ✅ CORRECCIÓN: Se usa 'unknown' en lugar de 'any'
        console.error('Error al obtener servicios:', err);
        const error = err as ApiError; // Asumimos que el error tiene la forma de ApiError
        setError(error.response?.data?.message || 'Error al cargar los servicios disponibles.');
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  const handlePurchaseService = async (serviceId: string) => {
    if (authLoading || !user?.id) {
      setPurchaseError('No se pudo procesar la compra: Usuario no autenticado.');
      return;
    }

    setPurchasingServiceId(serviceId);
    setPurchaseMessage(null);
    setPurchaseError(null);

    try {
      const newOrder = await orderService.createOrder(user.id, serviceId);
      setPurchaseMessage(`¡Compra realizada! Tu orden #${newOrder.id.substring(0, 8)}... está ${newOrder.estado}.`);
    } catch (err: unknown) { // ✅ CORRECCIÓN: Se usa 'unknown' en lugar de 'any'
      console.error('Error al comprar servicio:', err);
      const error = err as ApiError; // Asumimos que el error tiene la forma de ApiError
      setPurchaseError(error.response?.data?.message || 'Error al procesar la compra. Verifica tus monedas.');
    } finally {
      setPurchasingServiceId(null);
    }
  };

  return (
    <div className="p-8 bg-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Tienda de Servicios</h1>
      <p className="text-lg text-gray-600 mb-8">
        Explora la lista de todos los servicios que puedes adquirir.
      </p>

      {purchaseMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-6" role="alert">
          <strong className="font-bold">Éxito:</strong>
          <span className="block sm:inline"> {purchaseMessage}</span>
        </div>
      )}

      {purchaseError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
          <strong className="font-bold">Error en la compra:</strong>
          <span className="block sm:inline"> {purchaseError}</span>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-10">
          <p className="text-lg text-gray-600">Cargando servicios...</p>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      ) : services.length === 0 ? (
        <div className="text-center py-10 text-gray-500 text-lg">
          No hay servicios disponibles en este momento.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <div
              key={service.id}
              className="bg-white border border-gray-200 rounded-lg shadow-md p-6 flex flex-col justify-between transition-transform duration-200 hover:scale-[1.02]"
            >
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">{service.nombre}</h3>
                <p className="text-gray-600 text-sm mb-4">{service.descripcion}</p>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-lg font-semibold text-blue-600">
                    {service.precioMonedas} Monedas
                  </span>
                  <span
                    className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${service.requiereEntrega ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}
                  >
                    {service.requiereEntrega ? 'Requiere Entrega' : 'Digital'}
                  </span>
                </div>
                <p className="text-sm text-gray-500">
                  Tiempo de espera: {service.tiempoEsperaMinutos}
                </p>
              </div>
              <button
                onClick={() => handlePurchaseService(service.id)}
                className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105"
                disabled={purchasingServiceId === service.id || !service.activo}
              >
                {purchasingServiceId === service.id ? 'Comprando...' : service.activo ? 'Comprar' : 'Inactivo'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ServiciosPage;