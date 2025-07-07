// src/services/clientService.ts
import axiosClient from '../lib/axiosClient';
import { ClientUser } from '../types';

const clientService = {
    /**
     * Example: Get client's own profile data.
     * (You'd need an endpoint like GET /me or GET /users/{id} for the client's own ID)
     * @param userId The ID of the client.
     * @returns The client's user data.
     */
    getProfile: async (userId: string): Promise<ClientUser> => {
        const response = await axiosClient.get<ClientUser>(`/usuarios/${userId}`); // Assuming /usuarios/{id} endpoint
        return response.data;
    },

    // Add more client-specific API calls here as needed
    // 예를 들어:
    // getMyOrders: async (): Promise<Order[]> => {
    //   const response = await axiosClient.get<Order[]>('/clientes/me/orders');
    //   return response.data;
    // },
};

export default clientService;