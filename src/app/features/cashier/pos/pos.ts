// src/app/features/cashier/pos/pos.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { NavbarComponent } from '../../../shared/components/navbar/navbar';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar';
import { ProductService } from '../../../core/services/product.service';
import { CartService } from '../../../core/services/cart.service';
import { SalesService } from '../../../core/services/sales.service';
import { AuthService } from '../../../core/services/auth.service';
import { Product, CartItem, CreateSaleRequest, Invoice, InvoiceDetail, Payment } from '../../../core/models';
import { CATEGORIES, PAYMENT_METHODS, MESSAGES } from '../../../core/constants/app.constants';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-pos',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent, SidebarComponent],
  templateUrl: './pos.html',
  styleUrls: ['./pos.css']
})
export class PosComponent implements OnInit {
  // Productos
  products: Product[] = [];
  filteredProducts: Product[] = [];

  // Carrito
  cartItems: CartItem[] = [];
  subtotal = 0;
  iva = 0;
  total = 0;

  // Filtros
  searchTerm = '';
  selectedCategory = '';
  categories = CATEGORIES;

  // Pago
  selectedPaymentMethod = '';
  paymentMethods = PAYMENT_METHODS;

  // Estados
  loading = true;
  processingPayment = false;
  error = '';
  successMessage = '';

  // Modal de confirmación
  showConfirmModal = false;
  generatedInvoice: Invoice | null = null;

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private salesService: SalesService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadProducts();
    this.subscribeToCart();
  }

  /**
   * 🔌 Cargar productos
   */
  loadProducts(): void {
    this.loading = true;
    this.error = '';

    this.productService.getProducts().subscribe({
      next: (products) => {
        this.products = products.filter(p => p.cantidadDisponible > 0);
        this.filteredProducts = this.products;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando productos:', err);
        this.error = 'Error al cargar productos. Verifica tu conexión.';
        this.loading = false;
      }
    });
  }

  /**
   * Suscribirse al carrito
   */
  subscribeToCart(): void {
    this.cartService.cartItems$.subscribe(items => {
      this.cartItems = items;
    });

    this.cartService.getSubtotal().subscribe(subtotal => {
      this.subtotal = subtotal;
    });

    this.cartService.getIVA().subscribe(iva => {
      this.iva = iva;
    });

    this.cartService.getTotal().subscribe(total => {
      this.total = total;
    });
  }

  /**
   * Filtrar productos
   */
  filterProducts(): void {
    let filtered = this.products;

    if (this.searchTerm.trim()) {
      const search = this.searchTerm.toLowerCase();
      filtered = filtered.filter(p =>
        p.descripcion.toLowerCase().includes(search)
      );
    }

    if (this.selectedCategory) {
      filtered = filtered.filter(p => p.categoria === this.selectedCategory);
    }

    this.filteredProducts = filtered;
  }

  /**
   * Limpiar filtros
   */
  clearFilters(): void {
    this.searchTerm = '';
    this.selectedCategory = '';
    this.filteredProducts = this.products;
  }

  /**
   * Agregar producto al carrito
   */
  addToCart(product: Product): void {
    const success = this.cartService.addToCart(product, 1);
    if (success) {
      this.showSuccess(`${product.descripcion} agregado al carrito`);
    } else {
      this.showError('Stock insuficiente');
    }
  }

  /**
   * Aumentar cantidad en el carrito
   */
  increaseQuantity(item: CartItem): void {
    this.cartService.updateQuantity(item.product.idProducto, item.quantity + 1);
  }

  /**
   * Disminuir cantidad en el carrito
   */
  decreaseQuantity(item: CartItem): void {
    if (item.quantity > 1) {
      this.cartService.updateQuantity(item.product.idProducto, item.quantity - 1);
    } else {
      this.removeFromCart(item);
    }
  }

  /**
   * Remover del carrito
   */
  removeFromCart(item: CartItem): void {
    this.cartService.removeFromCart(item.product.idProducto);
  }

  /**
   * Limpiar carrito
   */
  clearCart(): void {
    this.cartService.clearCart();
    this.selectedPaymentMethod = '';
  }

  /**
   * Validar antes de procesar venta
   */
  validateSale(): boolean {
    if (this.cartItems.length === 0) {
      this.showError(MESSAGES.SALE.EMPTY_CART);
      return false;
    }

    if (!this.selectedPaymentMethod) {
      this.showError('Selecciona un método de pago');
      return false;
    }

    return true;
  }

  /**
   * 🔌 Procesar venta
   */
  processSale(): void {
    if (!this.validateSale()) return;

    this.processingPayment = true;
    this.error = '';

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.showError('Usuario no autenticado');
      this.processingPayment = false;
      return;
    }

    // Preparar datos de la venta
    const saleData: CreateSaleRequest = {
      invoice: {
        idUsuario: currentUser.idUsuario,
        fecha: new Date(),
        subtotal: this.subtotal,
        iva: this.iva,
        total: this.total
      },
      details: this.cartItems.map(item => ({
        idProducto: item.product.idProducto,
        cantidad: item.quantity,
        precioUnitario: item.product.precioUnitario,
        subtotal: item.subtotal
      })),
      payment: {
        metodoPago: this.selectedPaymentMethod as any,
        monto: this.total
      }
    };

    // 🔌 Llamada a la API
    this.salesService.createSale(saleData).subscribe({
      next: (invoice) => {
        this.processingPayment = false;
        this.generatedInvoice = invoice;
        this.showConfirmModal = true;
        this.cartService.clearCart();
        this.selectedPaymentMethod = '';
      },
      error: (err) => {
        console.error('Error procesando venta:', err);
        this.showError(MESSAGES.SALE.ERROR);
        this.processingPayment = false;
      }
    });
  }

  /**
   * Cerrar modal de confirmación
   */
  closeConfirmModal(): void {
    this.showConfirmModal = false;
    this.generatedInvoice = null;
  }

  /**
   * Mostrar mensaje de éxito
   */
  showSuccess(message: string): void {
    this.successMessage = message;
    setTimeout(() => {
      this.successMessage = '';
    }, 2000);
  }

  /**
   * Mostrar mensaje de error
   */
  showError(message: string): void {
    this.error = message;
    setTimeout(() => {
      this.error = '';
    }, 3000);
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
}
