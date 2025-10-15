// src/app/core/services/product.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Product } from '../models';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = `${environment.apiUrl}/productos`; // Conectado a /api/productos del backend

  constructor(private http: HttpClient) { }

  /**
   * ========================================
   *  OBTENER TODOS LOS PRODUCTOS
   * ========================================
   */
  getProducts(): Observable<Product[]> {

    return this.http.get<Product[]>(this.apiUrl)
      .pipe(catchError(this.handleError));
  }

  /**
   * Obtener un producto específico por su ID
   * @param id Identificador del producto
   * @returns Observable con los datos del producto
   */
  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * ========================================
   *  CREAR PRODUCTO
   * ========================================
   */
  createProduct(product: Product): Observable<Product> {

    return this.http.post<Product>(this.apiUrl, product)
      .pipe(catchError(this.handleError));
  }

  /**
   * Actualizar datos de un producto existente
   * @param id ID del producto a actualizar
   * @param product Nuevos datos del producto
   * @returns Observable con el producto actualizado
   */
  updateProduct(id: number, product: Product): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/${id}`, product)
      .pipe(catchError(this.handleError));
  }

  /**
   * Eliminar un producto del sistema
   * @param id ID del producto a eliminar
   * @returns Observable vacío
   */
  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * ========================================
   *  BUSCAR PRODUCTOS
   * ========================================
   */
  searchProducts(searchTerm: string): Observable<Product[]> {


    const params = new HttpParams().set('q', searchTerm);
    return this.http.get<Product[]>(`${this.apiUrl}/search`, { params })
      .pipe(catchError(this.handleError));
  }

  /**
   * ========================================
   *  OBTENER PRODUCTOS POR CATEGORÍA
   * ========================================
   */
  getProductsByCategory(category: string): Observable<Product[]> {
    // Conectado al endpoint /api/productos/categoria/{categoria}
    return this.http.get<Product[]>(`${this.apiUrl}/categoria/${category}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * ========================================
   *  OBTENER PRODUCTOS CON BAJO STOCK
   * ========================================
   */
  getLowStockProducts(threshold: number = 5): Observable<Product[]> {
    // Conectado al endpoint /api/productos/stock-bajo?limite=X
    const params = new HttpParams().set('limite', threshold.toString());
    return this.http.get<Product[]>(`${this.apiUrl}/stock-bajo`, { params })
      .pipe(catchError(this.handleError));
  }

  /**
   * Actualizar stock de un producto específico
   * @param productId ID del producto
   * @param quantity Nueva cantidad en stock
   * @returns Observable con el producto actualizado
   */
  updateStock(productId: number, quantity: number): Observable<Product> {
    return this.http.patch<Product>(`${this.apiUrl}/${productId}/stock`, { quantity })
      .pipe(catchError(this.handleError));
  }

  /**
   * Manejo centralizado de errores
   */
  private handleError(error: any): Observable<never> {
    console.error('Error en ProductService:', error);

    let errorMessage = 'Ocurrió un error al procesar la solicitud';

    if (error.error instanceof ErrorEvent) {
      // Error del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del servidor
      errorMessage = error.error?.message || `Error ${error.status}: ${error.message}`;
    }

    return throwError(() => new Error(errorMessage));
  }
}
