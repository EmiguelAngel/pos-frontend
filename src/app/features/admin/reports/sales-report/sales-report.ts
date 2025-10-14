// src/app/features/admin/reports/sales-report/sales-report.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { NavbarComponent } from '../../../../shared/components/navbar/navbar';
import { SidebarComponent } from '../../../../shared/components/sidebar/sidebar';
import { SalesService } from '../../../../core/services/sales.service';
import { UserService } from '../../../../core/services/user.service';
import { Invoice, InvoiceDetail, User } from '../../../../core/models';

@Component({
  selector: 'app-sales-report',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent, SidebarComponent],
  templateUrl: './sales-report.html',
  styleUrls: ['./sales-report.css']
})
export class SalesReportComponent implements OnInit {
  sales: Invoice[] = [];
  filteredSales: Invoice[] = [];
  users: User[] = [];

  // Filtros
  startDate = '';
  endDate = '';
  selectedUserId: number | null = null;

  // Modal de detalle
  showDetailModal = false;
  selectedSale: Invoice | null = null;
  saleDetails: InvoiceDetail[] = [];

  // Estados
  loading = true;
  loadingDetails = false;
  error = '';

  // Estadísticas
  totalSales = 0;
  totalRevenue = 0;

  constructor(
    private salesService: SalesService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
    this.loadSales();
  }

  /**
   * 🔌 Cargar usuarios (cajeros)
   */
  loadUsers(): void {
    this.userService.getUsers().subscribe({
      next: (users) => {
        // Filtrar solo cajeros (rol 2)
        this.users = users.filter(u => u.idRol === 2);
      },
      error: (err) => {
        console.error('Error cargando usuarios:', err);
      }
    });
  }

  /**
   * 🔌 Cargar ventas
   */
  loadSales(): void {
    this.loading = true;
    this.error = '';

    this.salesService.getAllSales().subscribe({
      next: (sales) => {
        this.sales = sales;
        this.filteredSales = sales;
        this.calculateStats();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando ventas:', err);
        this.error = 'Error al cargar ventas. Verifica tu conexión con el API.';
        this.loading = false;
      }
    });
  }

  /**
   * Filtrar ventas
   */
  filterSales(): void {
    let filtered = this.sales;

    // Filtro por fecha inicio
    if (this.startDate) {
      const start = new Date(this.startDate);
      filtered = filtered.filter(s => new Date(s.fecha) >= start);
    }

    // Filtro por fecha fin
    if (this.endDate) {
      const end = new Date(this.endDate);
      end.setHours(23, 59, 59);
      filtered = filtered.filter(s => new Date(s.fecha) <= end);
    }

    // Filtro por usuario
    if (this.selectedUserId !== null) {
      filtered = filtered.filter(s => s.idUsuario === this.selectedUserId);
    }

    this.filteredSales = filtered;
    this.calculateStats();
  }

  /**
   * Limpiar filtros
   */
  clearFilters(): void {
    this.startDate = '';
    this.endDate = '';
    this.selectedUserId = null;
    this.filteredSales = this.sales;
    this.calculateStats();
  }

  /**
   * Calcular estadísticas
   */
  calculateStats(): void {
    this.totalSales = this.filteredSales.length;
    this.totalRevenue = this.filteredSales.reduce((sum, sale) => sum + sale.total, 0);
  }

  /**
   * 🔌 Ver detalle de venta
   */
  viewDetails(sale: Invoice): void {
    this.selectedSale = sale;
    this.showDetailModal = true;
    this.loadingDetails = true;

    this.salesService.getSaleDetails(sale.idFactura).subscribe({
      next: (details) => {
        this.saleDetails = details;
        this.loadingDetails = false;
      },
      error: (err) => {
        console.error('Error cargando detalles:', err);
        this.loadingDetails = false;
      }
    });
  }

  /**
   * Cerrar modal de detalle
   */
  closeDetailModal(): void {
    this.showDetailModal = false;
    this.selectedSale = null;
    this.saleDetails = [];
  }

  /**
   * Obtener nombre de usuario
   */
  getUserName(userId: number): string {
    const user = this.users.find(u => u.idUsuario === userId);
    return user ? user.nombre : 'Desconocido';
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

  /**
   * Exportar a CSV (funcionalidad básica)
   */
  exportToCSV(): void {
    if (this.filteredSales.length === 0) {
      alert('No hay datos para exportar');
      return;
    }

    const headers = ['Factura', 'Cajero', 'Fecha', 'Subtotal', 'IVA', 'Total'];
    const rows = this.filteredSales.map(sale => [
      sale.idFactura,
      this.getUserName(sale.idUsuario),
      this.formatDate(sale.fecha),
      sale.subtotal,
      sale.iva,
      sale.total
    ]);

    let csvContent = headers.join(',') + '\n';
    rows.forEach(row => {
      csvContent += row.join(',') + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ventas_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  }
}
