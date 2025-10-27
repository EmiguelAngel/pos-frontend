// src/app/core/services/cart.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Product, CartItem } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItemsSubject = new BehaviorSubject<CartItem[]>([]);
  public cartItems$ = this.cartItemsSubject.asObservable();

  constructor() {
    // Cargar carrito de localStorage si existe
    this.loadCart();
  }

  /**
   * Obtener items actuales del carrito
   */
  getCartItems(): CartItem[] {
    return this.cartItemsSubject.value;
  }

  /**
   * Agregar producto al carrito
   */
  addToCart(product: Product, quantity: number = 1): boolean {
    const currentCart = this.getCartItems();

    // Validar stock disponible
    const stockDisponible = product.cantidadDisponible ?? 0;
    if (stockDisponible < quantity) {
      console.error('Stock insuficiente');
      return false;
    }

    // Buscar si el producto ya está en el carrito
    const existingItemIndex = currentCart.findIndex(
      item => item.product.idProducto === product.idProducto
    );

    if (existingItemIndex > -1) {
      // Si ya existe, actualizar cantidad
      const newQuantity = currentCart[existingItemIndex].quantity + quantity;

      // Validar stock
      const stockDisponible = product.cantidadDisponible ?? 0;
      if (newQuantity > stockDisponible) {
        console.error('Stock insuficiente');
        return false;
      }

      currentCart[existingItemIndex].quantity = newQuantity;
      currentCart[existingItemIndex].subtotal =
        (product.precioUnitario ?? 0) * newQuantity;
    } else {
      // Si no existe, agregar nuevo item
      const newItem: CartItem = {
        product: product,
        quantity: quantity,
        subtotal: (product.precioUnitario ?? 0) * quantity
      };
      currentCart.push(newItem);
    }

    this.updateCart(currentCart);
    return true;
  }

  /**
   * Remover producto del carrito
   */
  removeFromCart(productId: number): void {
    const currentCart = this.getCartItems();
    const updatedCart = currentCart.filter(
      item => item.product.idProducto !== productId
    );
    this.updateCart(updatedCart);
  }

  /**
   * Actualizar cantidad de un producto en el carrito
   */
  updateQuantity(productId: number, quantity: number): boolean {
    if (quantity <= 0) {
      this.removeFromCart(productId);
      return true;
    }

    const currentCart = this.getCartItems();
    const itemIndex = currentCart.findIndex(
      item => item.product.idProducto === productId
    );

    if (itemIndex === -1) {
      return false;
    }

    const item = currentCart[itemIndex];

    // Validar stock
    const stockDisponible = item.product.cantidadDisponible ?? 0;
    if (quantity > stockDisponible) {
      console.error('Stock insuficiente');
      return false;
    }

    // Actualizar cantidad y subtotal
    item.quantity = quantity;
    item.subtotal = (item.product.precioUnitario ?? 0) * quantity;

    this.updateCart(currentCart);
    return true;
  }

  /**
   * Limpiar todo el carrito
   */
  clearCart(): void {
    this.updateCart([]);
  }

  /**
   * Obtener cantidad total de items en el carrito
   */
  getCartItemCount(): Observable<number> {
    return this.cartItems$.pipe(
      map(items => items.reduce((total, item) => total + item.quantity, 0))
    );
  }

  /**
   * Calcular subtotal del carrito (sin IVA)
   */
  getSubtotal(): Observable<number> {
    return this.cartItems$.pipe(
      map(items => items.reduce((total, item) => total + item.subtotal, 0))
    );
  }

  /**
   * Calcular IVA del carrito
   */
  getIVA(): Observable<number> {
    return this.getSubtotal().pipe(
      map(subtotal => subtotal * environment.ivaPercentage)
    );
  }

  /**
   * Calcular total del carrito (con IVA)
   */
  getTotal(): Observable<number> {
    return this.getSubtotal().pipe(
      map(subtotal => subtotal * (1 + environment.ivaPercentage))
    );
  }

  /**
   * Verificar si el carrito está vacío
   */
  isEmpty(): Observable<boolean> {
    return this.cartItems$.pipe(
      map(items => items.length === 0)
    );
  }

  /**
   * Actualizar el carrito y guardar en localStorage
   */
  private updateCart(cart: CartItem[]): void {
    this.cartItemsSubject.next(cart);
    this.saveCart(cart);
  }

  /**
   * Guardar carrito en localStorage
   */
  private saveCart(cart: CartItem[]): void {
    try {
      localStorage.setItem('cart', JSON.stringify(cart));
    } catch (error) {
      console.error('Error saving cart to localStorage', error);
    }
  }

  /**
   * Cargar carrito desde localStorage
   */
  private loadCart(): void {
    try {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        const cart: CartItem[] = JSON.parse(savedCart);
        this.cartItemsSubject.next(cart);
      }
    } catch (error) {
      console.error('Error loading cart from localStorage', error);
    }
  }
}
