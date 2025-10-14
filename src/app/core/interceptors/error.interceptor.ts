// src/app/core/interceptors/error.interceptor.ts
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

/**
 * Interceptor para manejar errores HTTP globalmente
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'Ocurrió un error desconocido';

      if (error.error instanceof ErrorEvent) {
        // Error del lado del cliente
        errorMessage = `Error: ${error.error.message}`;
        console.error('Error del cliente:', errorMessage);
      } else {
        // Error del lado del servidor
        console.error('Error del servidor:', {
          status: error.status,
          message: error.message,
          error: error.error
        });

        switch (error.status) {
          case 400:
            errorMessage = error.error?.message || 'Solicitud inválida';
            break;

          case 401:
            // No autorizado - redirigir a login
            errorMessage = 'Sesión expirada. Por favor, inicia sesión nuevamente.';
            localStorage.clear();
            router.navigate(['/login']);
            break;

          case 403:
            errorMessage = 'No tienes permisos para realizar esta acción.';
            break;

          case 404:
            errorMessage = 'Recurso no encontrado.';
            break;

          case 409:
            errorMessage = error.error?.message || 'Conflicto con el recurso existente.';
            break;

          case 422:
            errorMessage = error.error?.message || 'Error de validación.';
            break;

          case 500:
            errorMessage = 'Error interno del servidor. Intenta más tarde.';
            break;

          case 503:
            errorMessage = 'Servicio no disponible. Intenta más tarde.';
            break;

          default:
            errorMessage = error.error?.message || `Error ${error.status}: ${error.message}`;
        }
      }

      // 🔧 AQUÍ PUEDES INTEGRAR UN SERVICIO DE NOTIFICACIONES
      // Ejemplo: this.notificationService.error(errorMessage);
      // Por ahora solo mostramos en consola
      console.error('Mensaje de error:', errorMessage);

      return throwError(() => new Error(errorMessage));
    })
  );
};
