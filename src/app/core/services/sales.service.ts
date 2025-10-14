// src/app/core/services/sales.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Invoice, InvoiceDetail, CreateSaleRequest } from '../models';

@Injectable({
  providedIn: 'root'
})
export class SalesService {
  private apiUrl = `${environment.apiUrl}/ventas`; // Conectado a /api/ventas del backend

  constructor(private http: HttpClient) { }

  /**
   * ========================================
   * 🔌 CREAR VENTA COMPLETA
   * ========================================
   */
  createSale(saleData: CreateSaleRequest): Observable<Invoice> {
    // Conectado al endpoint /api/ventas/procesar usando el patrón Facade
    return this.http.post<Invoice>(`${this.apiUrl}/procesar`, saleData)
      .pipe(catchError(this.handleError));
  }

  /**
   * ========================================
   * 🔌 VALIDAR VENTA (SIN PROCESAR)
   * ========================================
   */
  validateSale(saleData: CreateSaleRequest): Observable<any> {
    // Conectado al endpoint /api/ventas/validar
    return this.http.post<any>(`${this.apiUrl}/validar`, saleData)
      .pipe(catchError(this.handleError));
  }

  /**
   * ========================================
   * 🔌 OBTENER TODAS LAS VENTAS
   * ========================================
   */
  getAllSales(): Observable<Invoice[]> {
    // 🔌 CONECTA TU API AQUÍ
    return this.http.get<Invoice[]>(this.apiUrl)
      .pipe(catchError(this.handleError));
  }

  /**
   * ========================================
   * 🔌 OBTENER VENTA POR ID
   * ========================================
   */
  getSaleById(id: number): Observable<Invoice> {
    // 🔌 CONECTA TU API AQUÍ
    return this.http.get<Invoice>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * ========================================
   * 🔌 OBTENER VENTAS POR USUARIO (CAJERO)
   * ========================================
   */
  getSalesByUser(userId: number): Observable<Invoice[]> {
    // 🔌 CONECTA TU API AQUÍ
    return this.http.get<Invoice[]>(`${this.apiUrl}/user/${userId}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * ========================================
   * 🔌 OBTENER VENTAS POR RANGO DE FECHAS
   * ========================================
   */
  getSalesByDateRange(startDate: string, endDate: string): Observable<Invoice[]> {
    // 🔌 CONECTA TU API AQUÍ
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);

    return this.http.get<Invoice[]>(`${this.apiUrl}/date-range`, { params })
      .pipe(catchError(this.handleError));
  }

  /**
   * ========================================
   * 🔌 OBTENER DETALLES DE UNA VENTA
   * ========================================
   */
  getSaleDetails(invoiceId: number): Observable<InvoiceDetail[]> {
    // 🔌 CONECTA TU API AQUÍ
    return this.http.get<InvoiceDetail[]>(`${this.apiUrl}/${invoiceId}/details`)
      .pipe(catchError(this.handleError));
  }

  /**
   * ========================================
   * 🔌 OBTENER VENTAS DE HOY
   * ========================================
   */
  getTodaySales(): Observable<Invoice[]> {
    // 🔌 CONECTA TU API AQUÍ
    return this.http.get<Invoice[]>(`${this.apiUrl}/today`)
      .pipe(catchError(this.handleError));
  }

  /**
   * ========================================
   * 🔌 OBTENER VENTAS DEL MES
   * ========================================
   */
  getMonthSales(year: number, month: number): Observable<Invoice[]> {
    // 🔌 CONECTA TU API AQUÍ
    const params = new HttpParams()
      .set('year', year.toString())
      .set('month', month.toString());

    return this.http.get<Invoice[]>(`${this.apiUrl}/month`, { params })
      .pipe(catchError(this.handleError));
  }

  /**
   * ========================================
   * 🔌 OBTENER ESTADÍSTICAS DE VENTAS
   * ========================================
   */
  getSalesStats(): Observable<any> {
    // 🔌 CONECTA TU API AQUÍ
    return this.http.get<any>(`${this.apiUrl}/stats`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Manejo centralizado de errores
   */
  private handleError(error: any): Observable<never> {
    console.error('Error en SalesService:', error);

    let errorMessage = 'Ocurrió un error al procesar la solicitud';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = error.error?.message || `Error ${error.status}: ${error.message}`;
    }

    return throwError(() => new Error(errorMessage));
  }
}
