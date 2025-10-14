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
  private apiUrl = `${environment.apiUrl}/products`; // 🔧 Ajusta la ruta según tu API

  constructor(private http: HttpClient) { }

  /**
   * ========================================
   * 🔌 OBTENER TODOS LOS PRODUCTOS
   * ========================================
   */
  getProducts(): Observable<Product[]> {
    // 🔌 CONECTA TU API AQUÍ
    return this.http.get<Product[]>(this.apiUrl)
      .pipe(catchError(this.handleError));
  }

  /**
   * ========================================
   * 🔌 OBTENER PRODUCTO POR ID
   * ========================================
   */
  getProductById(id: number): Observable<Product> {
    // 🔌 CONECTA TU API AQUÍ
    return this.http.get<Product>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * ========================================
   * 🔌 CREAR PRODUCTO
   * ========================================
   */
  createProduct(product: Product): Observable<Product> {
    // 🔌 CONECTA TU API AQUÍ
    return this.http.post<Product>(this.apiUrl, product)
      .pipe(catchError(this.handleError));
  }

  /**
   * ========================================
   * 🔌 ACTUALIZAR PRODUCTO
   * ========================================
   */
  updateProduct(id: number, product: Product): Observable<Product> {
    // 🔌 CONECTA TU API AQUÍ
    return this.http.put<Product>(`${this.apiUrl}/${id}`, product)
      .pipe(catchError(this.handleError));
  }

  /**
   * ========================================
   * 🔌 ELIMINAR PRODUCTO
   * ========================================
   */
  deleteProduct(id: number): Observable<void> {
    // 🔌 CONECTA TU API AQUÍ
    return this.http.delete<void>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * ========================================
   * 🔌 BUSCAR PRODUCTOS
   * ========================================
   */
  searchProducts(searchTerm: string): Observable<Product[]> {
    // 🔌 CONECTA TU API AQUÍ
    // Ajusta el nombre del parámetro según tu backend (q, search, term, etc.)
    const params = new HttpParams().set('q', searchTerm);
    return this.http.get<Product[]>(`${this.apiUrl}/search`, { params })
      .pipe(catchError(this.handleError));
  }

  /**
   * ========================================
   * 🔌 OBTENER PRODUCTOS POR CATEGORÍA
   * ========================================
   */
  getProductsByCategory(category: string): Observable<Product[]> {
    // 🔌 CONECTA TU API AQUÍ
    return this.http.get<Product[]>(`${this.apiUrl}/category/${category}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * ========================================
   * 🔌 OBTENER PRODUCTOS CON BAJO STOCK
   * ========================================
   */
  getLowStockProducts(threshold: number = 10): Observable<Product[]> {
    // 🔌 CONECTA TU API AQUÍ
    const params = new HttpParams().set('threshold', threshold.toString());
    return this.http.get<Product[]>(`${this.apiUrl}/low-stock`, { params })
      .pipe(catchError(this.handleError));
  }

  /**
   * ========================================
   * 🔌 ACTUALIZAR STOCK DE PRODUCTO
   * ========================================
   */
  updateStock(productId: number, quantity: number): Observable<Product> {
    // 🔌 CONECTA TU API AQUÍ
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
