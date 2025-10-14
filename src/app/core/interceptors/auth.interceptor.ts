// src/app/core/interceptors/auth.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { environment } from '../../../environments/environment';

/**
 * Interceptor para agregar el token de autenticación a las peticiones HTTP
 *
 * 🔧 AJUSTA EL FORMATO DEL HEADER SEGÚN TU BACKEND:
 * - Authorization: Bearer {token}  (JWT estándar)
 * - X-Auth-Token: {token}
 * - Token: {token}
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Obtener token de localStorage
  const token = localStorage.getItem(environment.tokenKey);

  // Si hay token y la request va al API, agregar header
  if (token && req.url.startsWith(environment.apiUrl)) {

    // 🔧 OPCIÓN 1: JWT con Bearer (más común)
    const clonedRequest = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });

    /* 🔧 OPCIÓN 2: Header personalizado
    const clonedRequest = req.clone({
      setHeaders: {
        'X-Auth-Token': token
      }
    });
    */

    /* 🔧 OPCIÓN 3: Múltiples headers
    const clonedRequest = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    */

    return next(clonedRequest);
  }

  // Si no hay token o no es una petición al API, enviar request original
  return next(req);
};
