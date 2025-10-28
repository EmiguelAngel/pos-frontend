import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from '../../../../core/services/cart.service';
import { MercadoPagoButtonComponent } from './mercadopago-button/mercadopago-button.component';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, MercadoPagoButtonComponent],
  templateUrl: './cart.html',
  styleUrl: './cart.css'
})
export class Cart implements OnInit {
  cartItems: any[] = [];
  total: number = 0;
  hasPendingMercadoPagoPayment: boolean = false;

  constructor(private cartService: CartService) {}

  ngOnInit() {
    this.loadCart();
    this.checkPendingPayment();
  }

  private checkPendingPayment() {
    // Verificar si hay items guardados de Mercado Pago
    const savedItems = localStorage.getItem('mp_cart_items');
    if (savedItems) {
      this.hasPendingMercadoPagoPayment = true;
      console.log('⚠️ Hay un pago pendiente de Mercado Pago');
    }
  }

  completeMercadoPagoPayment() {
    // Emitir evento al componente padre (POS) para que procese la venta
    window.location.href = '/cashier/pos?payment=success';
  }

  private loadCart() {
    this.cartItems = this.cartService.getCartItems();
    this.calculateTotal();
    console.log('🛒 Cart loaded - Items count:', this.cartItems.length);
    console.log('🛒 Cart loaded - Items:', this.cartItems);
    console.log('🛒 Cart loaded - Total:', this.total);

    // Suscribirse a cambios en el carrito
    this.cartService.cartItems$.subscribe(items => {
      console.log('🔔 === CART SERVICE NOTIFICÓ CAMBIO ===');
      console.log('🔔 Nuevos items recibidos:', items);
      console.log('🔔 Cantidad de items:', items.length);
      console.log('🔔 Items detallados:', JSON.stringify(items, null, 2));
      
      this.cartItems = items;
      this.calculateTotal();
      
      console.log('🛒 Cart updated - cartItems ahora tiene:', this.cartItems.length, 'items');
      console.log('🛒 Cart updated - Total:', this.total);
    });
  }

  private calculateTotal() {
    this.total = this.cartItems.reduce((sum, item) => sum + item.subtotal, 0);
  }

  // Tu método original de pago
  processLocalPayment() {
    // Mantén tu lógica original de pago aquí
    console.log('Procesando pago con método original');
  }
}
