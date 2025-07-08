// src/services/authService.ts
import axiosClient from '../lib/axiosClient';
import { AuthResponse, LoginPayload, RegisterPayload } from '../types';

export const authService = {
    /**
     * Handles user login.
     * POST /auth/login
     * @param credentials User's email and password.
     * @returns AuthResponse containing user data and JWT token.
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
        const response = await axiosClient.post<AuthResponse>('/auth/register', userData);
        return response.data;
    },
};