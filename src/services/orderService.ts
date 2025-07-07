// my-client-app/src/services/
import axiosClient from '../lib/axiosClient';
import { Order, CreateOrderPayload } from '../types';

/**
 * Servicio para la gestión de órdenes en la aplicación del cliente.
 */
const orderService = {
    /**
     * Crea una nueva orden para un usuario específico.
     * POST /ordenes/{usuarioId}
     * @param userId El ID del usuario que realiza la compra.
     * @param serviceId El ID del servicio que se está comprando.
     * @returns La orden creada.
     */
    createOrder: async (userId: string, serviceId: string): Promise<Order> => {
        const payload: CreateOrderPayload = { servicioId: serviceId };
        const response = await axiosClient.post<Order>(`/ordenes/${userId}`, payload);
        return response.data;
    },

    /**
     * Obtiene todas las órdenes de un cliente específico.
     * GET /ordenes/mis/{usuarioId}
     * @param userId El ID del cliente.
     * @returns Un array de órdenes del cliente.
     */
    getClientOrders: async (userId: string): Promise<Order[]> => {
        const response = await axiosClient.get<Order[]>(`/ordenes/mis/${userId}`);
        return response.data;
    },
};

export default orderService;