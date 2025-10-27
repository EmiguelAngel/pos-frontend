// src/app/features/admin/dashboard/dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { NavbarComponent } from '../../../shared/components/navbar/navbar';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar';
import { ProductService } from '../../../core/services/product.service';
import { UserService } from '../../../core/services/user.service';
import { SalesService } from '../../../core/services/sales.service';
import { Product, User, Invoice } from '../../../core/models';
import { STOCK } from '../../../core/constants/app.constants';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, NavbarComponent, SidebarComponent],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent implements OnInit {
  // Estadísticas
  totalProducts = 0;
  totalUsers = 0;
  totalSales = 0;
  totalRevenue = 0;
  lowStockProducts = 0;

  // Datos
  recentSales: Invoice[] = [];
  lowStockProductsList: Product[] = [];

  // Estado de carga
  loading = true;
  error = '';

  constructor(
    private productService: ProductService,
    private userService: UserService,
    private salesService: SalesService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  /**
   * Cargar todos los datos del dashboard
   */
  loadDashboardData(): void {
    this.loading = true;
    this.error = '';

    // Cargar productos desde el backend
    this.productService.getProducts().subscribe({
      next: (products) => {
        this.totalProducts = products.length;
        this.lowStockProductsList = products.filter(
          p => (p.cantidadDisponible ?? 0) <= STOCK.LOW_THRESHOLD
        );
        this.lowStockProducts = this.lowStockProductsList.length;
      },
      error: (err) => {
        console.error('Error cargando productos:', err);
        this.error = 'Error al cargar algunos datos';
      }
    });

    // Cargar usuarios
    this.userService.getUsers().subscribe({
      next: (users) => {
        this.totalUsers = users.length;
      },
      error: (err) => {
        console.error('Error cargando usuarios:', err);
      }
    });

    // Cargar ventas
    this.salesService.getAllSales().subscribe({
      next: (sales) => {
        this.totalSales = sales.length;
        this.totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);
        // Últimas 5 ventas
        this.recentSales = sales.slice(0, 5);
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando ventas:', err);
        this.loading = false;
        this.error = 'Error al cargar datos. Verifica tu conexión con el API.';
      }
    });
  }

  /**
   * Navegar a productos
   */
  goToProducts(): void {
    this.router.navigate(['/admin/products']);
  }

  /**
   * Navegar a usuarios
   */
  goToUsers(): void {
    this.router.navigate(['/admin/users']);
  }

  /**
   * Navegar a reportes
   */
  goToReports(): void {
    this.router.navigate(['/admin/reports']);
  }

  /**
   * Formatear moneda
   */
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  }

  /**
   * Formatear fecha
   */
  formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
