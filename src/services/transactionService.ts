// my-client-app/src/services/transactionService.ts
import axiosClient from '../lib/axiosClient';
import { Transaction } from '../types';

/**
 * Servicio para obtener las transacciones de un cliente.
 */
const transactionService = {
    /**
     * Obtiene el historial de transacciones de un cliente específico.
     * GET /transacciones/mis/{usuarioId}
     * @param userId El ID del cliente.
     * @returns Un array de transacciones del cliente.
     */
    getClientTransactions: async (userId: string): Promise<Transaction[]> => {
        const response = await axiosClient.get<Transaction[]>(`/transacciones/mis/${userId}`);
        return response.data;
    },
};

export default transactionService;
