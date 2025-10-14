// src/app/core/models/index.ts
// Exportar todas las interfaces desde un solo archivo

// ==================== ROLE ====================
export interface Role {
  idRol: number;
  nombreRol: string;
}

// ==================== USER ====================
export interface User {
  idUsuario: number;
  idRol: number;
  nombre: string;
  correo: string;
  contrasena?: string; // Opcional al recibir del backend
  telefono: string;
}

// ==================== PRODUCT ====================
export interface Product {
  idProducto: number;
  cantidadDisponible: number;
  precioUnitario: number;
  descripcion: string;
  categoria: string;
}

// ==================== INVENTORY ====================
export interface Inventory {
  idInventario: number;
  idProducto: number;
  fechaActualizacion: Date | string;
  cantidadDisponible: number;
}

// ==================== INVOICE ====================
export interface Invoice {
  idFactura: number;
  idUsuario: number;
  idPago: number;
  fecha: Date | string;
  subtotal: number;
  iva: number;
  total: number;
  // Campos adicionales opcionales
  nombreUsuario?: string;
  nombreCajero?: string;
}

// ==================== INVOICE DETAIL ====================
export interface InvoiceDetail {
  idDetalle: number;
  idProducto: number;
  idFactura: number;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  // Campos adicionales opcionales
  nombreProducto?: string;
}

// ==================== PAYMENT ====================
export interface Payment {
  idPago: number;
  idFactura: number;
  metodoPago: 'Efectivo' | 'Tarjeta Crédito' | 'Tarjeta Débito' | 'Transferencia';
  monto: number;
}

// ==================== CART ITEM (Frontend Only) ====================
export interface CartItem {
  product: Product;
  quantity: number;
  subtotal: number;
}

// ==================== AUTH RESPONSE ====================
export interface AuthResponse {
  token?: string;
  user: User;
  message?: string;
  expiresIn?: number;
}

export interface LoginRequest {
  correo: string;
  contrasena: string;
}

// ==================== API RESPONSE WRAPPER ====================
// Si tu API usa un formato estándar de respuesta
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
}

// ==================== SALE REQUEST ====================
// Para crear una venta completa - Coincide con VentaRequest del backend
export interface CreateSaleRequest {
  idUsuario: number;
  items: ItemVenta[];
  datosPago: DatosPago;
}

export interface ItemVenta {
  idProducto: number;
  cantidad: number;
}

export interface DatosPago {
  metodoPago: 'EFECTIVO' | 'TARJETA_CREDITO' | 'TARJETA_DEBITO' | 'TRANSFERENCIA';
  numeroTarjeta?: string;
  nombreTitular?: string;
  codigoSeguridad?: string;
  mesVencimiento?: string;
  anoVencimiento?: string;
}

// ==================== DASHBOARD STATS ====================
export interface DashboardStats {
  totalVentas: number;
  totalProductos: number;
  totalUsuarios: number;
  productosLowStock: number;
  ventasHoy: number;
  ventasMes: number;
}
