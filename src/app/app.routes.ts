// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  // Ruta por defecto
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },

  // Login (sin protección)
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component')
      .then(m => m.LoginComponent)
  },

  // ============================================
  // RUTAS DE ADMINISTRADOR (ROL 1)
  // ============================================
  // 🔧 TEMPORALMENTE COMENTADAS - Descomentar cuando existan los componentes

  {
    path: 'admin',
    canActivate: [authGuard, roleGuard],
    data: { role: 1 },
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/admin/dashboard/dashboard')
          .then(m => m.DashboardComponent)
      },
      {
        path: 'products',
        loadComponent: () => import('./features/admin/products/product-list/product-list')
          .then(m => m.ProductList)
      },
      {
        path: 'users',
        loadComponent: () => import('./features/admin/users/user-list/user-list')
          .then(m => m.UserList)
      },
      {
        path: 'reports',
        loadComponent: () => import('./features/admin/reports/sales-report/sales-report')
          .then(m => m.SalesReport)
      }
    ]
  },
  // ============================================
  // RUTAS DE CAJERO (ROL 2)
  // ============================================
  {
    path: 'cajero',
    canActivate: [authGuard, roleGuard],
    data: { role: 2 }, // Solo Cajero
    children: [
      {
        path: '',
        redirectTo: 'punto-venta',
        pathMatch: 'full'
      },
      {
        path: 'punto-venta',
        loadComponent: () => import('./features/cashier/pos/pos')
          .then(m => m.Pos)
      },
      {
        path: 'historial',
        loadComponent: () => import('./features/cashier/sales-history/sales-history')
          .then(m => m.SalesHistory)
      }
    ]
  },

  // Ruta 404 - Not Found
  {
    path: '**',
    redirectTo: '/login'
  }
];
