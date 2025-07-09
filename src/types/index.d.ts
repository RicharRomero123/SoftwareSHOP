// my-client-app/src/types/index.d.ts

export type UserRole = 'ADMIN' | 'CLIENTE';

export interface AuthResponse {
    id: string;
    nombre: string;
    email: string;
    rol: UserRole;
    message: string;
    token: string; // <-- NUEVO: El token JWT
    type: string; // <-- NUEVO: Tipo de token (ej. "Bearer")
    monedas?: number; // Monedas es opcional al inicio, se cargará después
}

export interface VerifyCodePayload {
    email: string;
    codigo: string; // Código de verificación enviado al email
}

export interface UserSession {
    id: string;
    nombre: string;
    email: string;
    rol: UserRole;
    monedas?: number; // Monedas es opcional al inicio, se cargará después
}

export interface RegisterPayload {
    nombre: string;
    email: string;
    password?: string;
}

export interface LoginPayload {
    email: string;
    password: string;
}

// Interfaz completa para el usuario cliente (con monedas)
export interface ClientUser {
    id: string;
    nombre: string;
    email: string;
    rol: UserRole;
    monedas: number;
}

/**
 * Interfaz para la estructura de un servicio.
 */
export interface Service {
    id: string;
    nombre: string;
    descripcion: string;
    precioMonedas: number;
    requiereEntrega: boolean;
    activo: boolean;
    tiempoEsperaMinutos: string; // O number si el backend lo envía como tal
    fechaCreacion: string;
    imgUrl:string;
}

/**
 * Define los posibles estados de una orden.
 */
export type OrderStatus = 'PENDIENTE' | 'PROCESANDO' | 'COMPLETADO' | 'CANCELADO';

/**
 * Interfaz para los detalles de entrega de una orden.
 */
export interface DeliveryDetails {
    id: string;
    usuarioCuenta: string;
    clave: string;
    nota?: string;
}

/**
 * Interfaz para la estructura completa de una orden.
 */
export interface Order {
    id: string;
    usuarioId: string;
    usuarioNombre: string;
    servicioId: string;
    servicioNombre: string;
    estado: OrderStatus;
    fechaCreacion: string;
    fechaEntrega: string | null;
    tiempoEstimadoEspera: string;
    entrega: DeliveryDetails | null;
}

/**
 * Interfaz para el payload de creación de una orden.
 */
export interface CreateOrderPayload {
    servicioId: string;
}

/**
 * Define los tipos de transacción.
 */
export type TransactionType = 'RECARGA' | 'GASTO'| 'REEMBOLSO';

/**
 * Interfaz para la estructura de una transacción.
 */
export interface Transaction {
    id: string;
    usuarioId: string;
    usuarioNombre: string;
    tipo: TransactionType;
    cantidad: number; // Puede ser positivo (recarga) o negativo (gasto)
    descripcion: string;
    fecha: string;
}