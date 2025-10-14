// src/app/core/constants/app.constants.ts

// ==================== CATEGORÍAS DE PRODUCTOS ====================
export const CATEGORIES = [
  'Granos',
  'Aceites',
  'Endulzantes',
  'Panadería',
  'Lácteos',
  'Bebidas',
  'Carnes',
  'Frutas',
  'Verduras',
  'Aseo',
  'Snacks',
  'Congelados'
];

// ==================== MÉTODOS DE PAGO ====================
export const PAYMENT_METHODS = [
  'Efectivo',
  'Tarjeta Crédito',
  'Tarjeta Débito',
  'Transferencia'
] as const;

// ==================== ROLES ====================
export const ROLES = {
  ADMIN: 1,
  CAJERO: 2
} as const;

export const ROLE_NAMES = {
  [ROLES.ADMIN]: 'Administrador',
  [ROLES.CAJERO]: 'Cajero'
};

// ==================== IVA ====================
export const IVA_PERCENTAGE = 0.19; // 19%

// ==================== RUTAS ====================
export const ROUTES = {
  LOGIN: '/login',
  ADMIN: {
    BASE: '/admin',
    DASHBOARD: '/admin/dashboard',
    PRODUCTS: '/admin/products',
    USERS: '/admin/users',
    REPORTS: '/admin/reports'
  },
  CAJERO: {
    BASE: '/cajero',
    POS: '/cajero/punto-venta',
    HISTORY: '/cajero/historial'
  }
} as const;

// ==================== MENSAJES ====================
export const MESSAGES = {
  LOGIN: {
    SUCCESS: 'Inicio de sesión exitoso',
    ERROR: 'Credenciales incorrectas',
    REQUIRED: 'Por favor ingrese sus credenciales'
  },
  PRODUCT: {
    CREATED: 'Producto creado exitosamente',
    UPDATED: 'Producto actualizado exitosamente',
    DELETED: 'Producto eliminado exitosamente',
    ERROR: 'Error al procesar el producto',
    LOW_STOCK: 'Stock bajo - Menos de 10 unidades'
  },
  USER: {
    CREATED: 'Usuario creado exitosamente',
    UPDATED: 'Usuario actualizado exitosamente',
    DELETED: 'Usuario eliminado exitosamente',
    ERROR: 'Error al procesar el usuario'
  },
  SALE: {
    SUCCESS: 'Venta procesada exitosamente',
    ERROR: 'Error al procesar la venta',
    EMPTY_CART: 'El carrito está vacío',
    INSUFFICIENT_STOCK: 'Stock insuficiente'
  },
  GENERAL: {
    ERROR: 'Ocurrió un error. Intente nuevamente',
    LOADING: 'Cargando...',
    NO_DATA: 'No hay datos disponibles',
    CONFIRM_DELETE: '¿Está seguro de eliminar este registro?'
  }
};

// ==================== CONFIGURACIÓN DE PAGINACIÓN ====================
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [5, 10, 25, 50]
};

// ==================== STOCK ====================
export const STOCK = {
  LOW_THRESHOLD: 10,
  CRITICAL_THRESHOLD: 5
};
