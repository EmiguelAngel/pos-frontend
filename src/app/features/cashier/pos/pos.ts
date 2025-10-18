// src/app/features/cashier/pos/pos.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

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
    private authService: AuthService,
    private http: HttpClient
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
      idUsuario: currentUser.idUsuario,
      items: this.cartItems.map(item => ({
        idProducto: item.product.idProducto,
        cantidad: item.quantity
      })),
      datosPago: {
        metodoPago: this.selectedPaymentMethod as 'EFECTIVO' | 'TARJETA_CREDITO' | 'TARJETA_DEBITO' | 'TRANSFERENCIA'
      }
    };

    // 🔌 Llamada a la API
    console.log('Datos a enviar:', saleData);
    
    // Hacer la llamada directamente con HttpClient para tener más control
    this.salesService.createSale(saleData).subscribe({
      next: (invoice) => {
        console.log('Venta procesada exitosamente:', invoice);
        this.processingPayment = false;
        this.generatedInvoice = invoice;
        this.showConfirmModal = true;
        this.cartService.clearCart();
        this.selectedPaymentMethod = '';
      },
      error: (httpError) => {
        console.error('🚨 === ANÁLISIS COMPLETO DEL ERROR ===');
        console.error('1. Error completo:', httpError);
        console.error('2. Constructor:', httpError.constructor.name);
        console.error('3. Status:', httpError.status);
        console.error('4. StatusText:', httpError.statusText);
        console.error('5. Error body:', httpError.error);
        console.error('6. Message:', httpError.message);
        console.error('7. Name:', httpError.name);
        console.error('8. Todas las propiedades:', Object.getOwnPropertyNames(httpError));
        
        // Intento más robusto de extraer información
        let errorMessage = 'Error procesando venta';
        let statusCode = 'sin-estado';
        
        try {
          // Priorizar el mensaje del backend
          if (httpError.error && typeof httpError.error === 'object') {
            if (httpError.error.mensaje) {
              errorMessage = httpError.error.mensaje;
            } else if (httpError.error.message) {
              errorMessage = httpError.error.message;
            }
          } else if (httpError.error && typeof httpError.error === 'string') {
            errorMessage = httpError.error;
          } else if (httpError.message) {
            errorMessage = httpError.message;
          }
          
          // Obtener código de estado
          if (typeof httpError.status === 'number') {
            statusCode = httpError.status.toString();
          } else if (httpError.status) {
            statusCode = String(httpError.status);
          }
          
        } catch (parseError) {
          console.error('Error parseando el error:', parseError);
          errorMessage = 'Error interno del sistema';
        }
        
        const finalMessage = `${errorMessage} [${statusCode}]`;
        console.log('Mensaje final:', finalMessage);
        
        this.showError(finalMessage);
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
   * Descargar factura en PDF
   */
  downloadInvoicePdf(): void {
    if (!this.generatedInvoice || !this.generatedInvoice.idFactura) {
      console.error('No hay factura para descargar');
      return;
    }

    console.log('📄 Descargando PDF de factura:', this.generatedInvoice.idFactura);
    
    const url = `${environment.apiUrl}/ventas/factura/${this.generatedInvoice.idFactura}/pdf`;
    
    this.http.get(url, { 
      responseType: 'blob',
      observe: 'response' 
    }).subscribe({
      next: (response) => {
        console.log('✅ PDF descargado exitosamente');
        
        // Crear blob y descargar
        const blob = response.body;
        if (blob) {
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `factura_${this.generatedInvoice!.idFactura}.pdf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
          
          this.showSuccess('PDF descargado correctamente');
        }
      },
      error: (error) => {
        console.error('❌ Error descargando PDF:', error);
        this.showError('Error al descargar la factura PDF');
      }
    });
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
