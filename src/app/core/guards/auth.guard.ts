// src/app/core/guards/auth.guard.ts
import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ROUTES } from '../constants/app.constants';

/**
 * Guard para proteger rutas que requieren autenticación
 *
 * Uso en routing:
 * {
 *   path: 'admin',
 *   canActivate: [authGuard],
 *   component: AdminComponent
 * }
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Verificar si el usuario está autenticado
  if (authService.isAuthenticated()) {
    return true;
  }

  // Si no está autenticado, redirigir al login
  console.warn('Acceso denegado. Redirigiendo a login...');
  router.navigate([ROUTES.LOGIN], {
    queryParams: { returnUrl: state.url }
  });

  return false;
};
