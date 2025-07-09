// src/services/authService.ts
import axiosClient from '../lib/axiosClient';
// Asegúrate de que tu archivo 'types.ts' incluya 'VerifyCodePayload'
import { AuthResponse, LoginPayload, RegisterPayload, VerifyCodePayload } from '../types';

export const authService = {
  /**
   * Handles user login.
   * POST /auth/login
   */
  login: async (credentials: LoginPayload): Promise<AuthResponse> => {
    const response = await axiosClient.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  },

  /**
   * ✅ RENOMBRADO: Solicita un código de verificación al email del usuario.
   * POST /auth/solicitar-registro
   */
  requestRegistration: async (userData: RegisterPayload): Promise<{ message: string }> => {
    const response = await axiosClient.post<{ message: string }>('/auth/solicitar-registro', userData);
    return response.data;
  },

  /**
   * ✅ NUEVO: Verifica el código para completar el registro.
   * POST /auth/verificar-codigo
   */
  verifyCode: async (payload: VerifyCodePayload): Promise<AuthResponse> => {
    const response = await axiosClient.post<AuthResponse>('/auth/verificar-codigo', payload);
    return response.data;
  },
};