// src/app/features/cashier/sales-history/sales-history.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { NavbarComponent } from '../../../shared/components/navbar/navbar';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar';
import { DevolucionModalComponent } from '../../../shared/components/devolucion-modal/devolucion-modal';
import { SalesService } from '../../../core/services/sales.service';
import { AuthService } from '../../../core/services/auth.service';
import { Invoice, InvoiceDetail } from '../../../core/models';

@Component({
  selector: 'app-sales-history',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent, SidebarComponent, DevolucionModalComponent],
  templateUrl: './sales-history.html',
  styleUrls: ['./sales-history.css']
})
export class SalesHistoryComponent implements OnInit {
  sales: Invoice[] = [];
  filteredSales: Invoice[] = [];

  // Filtros
  startDate = '';
  endDate = '';

  // Modal de detalle
  showDetailModal = false;
  selectedSale: Invoice | null = null;
  saleDetails: InvoiceDetail[] = [];

  // Modal de devolución
  showDevolucionModal = false;
  facturaParaDevolucion: Invoice | null = null;

  // Estados
  loading = true;
  loadingDetails = false;
  error = '';

  // Estadísticas
  totalSales = 0;
  totalRevenue = 0;

  constructor(
    private salesService: SalesService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadSales();
  }

  /**
   * 🔌 Cargar ventas del cajero actual
   */
  loadSales(): void {
    this.loading = true;
    this.error = '';

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.error = 'Usuario no autenticado';
      this.loading = false;
      return;
    }

    this.salesService.getSalesByUser(currentUser.idUsuario).subscribe({
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

    this.filteredSales = filtered;
    this.calculateStats();
  }

  /**
   * Limpiar filtros
   */
  clearFilters(): void {
    this.startDate = '';
    this.endDate = '';
    this.filteredSales = this.sales;
    this.calculateStats();
  }

  /**
   * Calcular estadísticas
   */
  calculateStats(): void {
    this.totalSales = this.filteredSales.length;
    
    // Excluir ventas devueltas del total de ingresos
    this.totalRevenue = this.filteredSales
      .filter(sale => !sale.devuelta) // Solo contar ventas NO devueltas
      .reduce((sum, sale) => sum + sale.total, 0);
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
   * Verificar si una factura puede ser devuelta
   */
  puedeSerDevuelta(factura: Invoice): boolean {
    // Solo se puede devolver si NO está devuelta
    // Ahora soporta devoluciones con o sin Mercado Pago
    return !factura.devuelta;
  }

  /**
   * Abrir modal de devolución
   */
  abrirModalDevolucion(factura: Invoice): void {
    this.facturaParaDevolucion = factura;
    this.showDevolucionModal = true;
  }

  /**
   * Cerrar modal de devolución
   */
  cerrarModalDevolucion(): void {
    this.showDevolucionModal = false;
    this.facturaParaDevolucion = null;
  }

  /**
   * Manejar devolución exitosa
   */
  onDevolucionExitosa(): void {
    console.log('✅ Devolución procesada exitosamente, recargando ventas...');
    
    // Recargar lista de ventas para reflejar el cambio
    this.loadSales();
    
    // Mostrar mensaje de éxito temporal
    this.error = ''; // Limpiar errores previos
  }

  /**
   * Obtener nombre de usuario actual
   */
  get usuarioActual(): string {
    const user = this.authService.getCurrentUser();
    return user?.nombreUsuario || 'Sistema';
  }
}
