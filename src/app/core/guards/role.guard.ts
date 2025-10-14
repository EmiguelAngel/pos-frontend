// src/app/core/guards/role.guard.ts
import { inject } from '@angular/core';
import { Router, CanActivateFn, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ROUTES } from '../constants/app.constants';

/**
 * Guard para proteger rutas por rol específico
 *
 * Uso en routing:
 * {
 *   path: 'admin',
 *   canActivate: [authGuard, roleGuard],
 *   data: { role: 1 }, // 1 = Admin, 2 = Cajero
 *   component: AdminComponent
 * }
 */
export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Obtener el rol requerido de la configuración de la ruta
  const requiredRole = route.data['role'] as number;

  // Obtener el rol del usuario actual
  const userRole = authService.getUserRole();

  // Verificar si el usuario tiene el rol requerido
  if (userRole === requiredRole) {
    return true;
  }

  // Si no tiene el rol correcto, redirigir según su rol
  console.warn(`Acceso denegado. Rol requerido: ${requiredRole}, Rol actual: ${userRole}`);

  if (userRole === 1) {
    // Es admin pero intentó acceder a ruta de cajero
    router.navigate([ROUTES.ADMIN.DASHBOARD]);
  } else if (userRole === 2) {
    // Es cajero pero intentó acceder a ruta de admin
    router.navigate([ROUTES.CAJERO.POS]);
  } else {
    // No tiene rol válido
    router.navigate([ROUTES.LOGIN]);
  }

  return false;
};
