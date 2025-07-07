// src/services/authService.ts
import axiosClient from '../lib/axiosClient';
import { AuthResponse, LoginPayload, RegisterPayload } from '../types';

export const authService = {
    /**
     * Handles user login.
     * POST /auth/login
     * @param credentials User's email and password.
     * @returns AuthResponse containing user data.
     */
    login: async (credentials: LoginPayload): Promise<AuthResponse> => {
        const response = await axiosClient.post<AuthResponse>('/auth/login', credentials);
        return response.data;
    },

    /**
     * Handles user registration.
     * POST /auth/register
     * @param userData User's name, email, and password.
     * @returns AuthResponse containing user data after registration.
     */
    register: async (userData: RegisterPayload): Promise<AuthResponse> => {
        // Note: Assuming a /auth/register endpoint exists on your backend
        // and it accepts 'nombre', 'email', 'password'.
        // The role will likely be defaulted to 'CLIENTE' by the backend for this endpoint.
        const response = await axiosClient.post<AuthResponse>('/auth/register', userData);
        return response.data;
    },
};