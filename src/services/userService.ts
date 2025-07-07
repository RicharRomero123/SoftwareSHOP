// my-client-app/src/services/userService.ts
import axiosClient from '../lib/axiosClient';
import { ClientUser } from '../types';

/**
 * Servicio para obtener información de usuarios en la aplicación del cliente.
 */
const userService = {
    /**
     * Obtiene los detalles de un usuario por su ID.
     * GET /usuarios/{id}
     * @param id El ID del usuario.
     * @returns Los detalles del usuario.
     */
    getUserById: async (id: string): Promise<ClientUser> => {
        const response = await axiosClient.get<ClientUser>(`/usuarios/${id}`);
        return response.data;
    },
};

export default userService;
