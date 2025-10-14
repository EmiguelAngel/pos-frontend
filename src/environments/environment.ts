// src/environments/environment.ts

export const environment = {
  production: false,

  // 🔧 CONFIGURA AQUÍ LA URL DE TU API
  apiUrl: 'http://localhost:8080/api', // Cambia el puerto según tu backend

  // Configuraciones generales
  appName: 'Sistema POS',
  version: '1.0.0',

  // Keys para localStorage
  tokenKey: 'auth_token',
  userKey: 'current_user',

  // Configuración de IVA (Colombia)
  ivaPercentage: 0.19, // 19%

  // Timeout para peticiones HTTP (milisegundos)
  httpTimeout: 30000
};
