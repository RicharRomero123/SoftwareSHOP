// my-client-app/src/services/serviceService.ts
import axiosClient from '../lib/axiosClient';
import { Service } from '../types';

/**
 * Servicio para obtener información de servicios en la aplicación del cliente.
 */
const serviceService = {
    /**
     * Obtiene la lista completa de todos los servicios disponibles.
     * GET /servicios
     * Este endpoint es accesible tanto por clientes como por administradores.
     * @returns Un array de servicios.
     */
    getAllServices: async (): Promise<Service[]> => {
        const response = await axiosClient.get<Service[]>('/servicios');
        return response.data;
    },
};

export default serviceService;