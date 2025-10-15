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
   * Obtener todas las ventas del sistema
   * @returns Observable con array de facturas
   */
  getAllSales(): Observable<Invoice[]> {
    return this.http.get<Invoice[]>(this.apiUrl)
      .pipe(catchError(this.handleError));
  }

  /**
   * Obtener una venta específica por su ID
   * @param id Identificador de la factura
   * @returns Observable con los datos de la factura
   */
  getSaleById(id: number): Observable<Invoice> {
    return this.http.get<Invoice>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Obtener ventas realizadas por un usuario específico (cajero)
   * @param userId ID del usuario cajero
   * @returns Observable con las ventas del usuario
   */
  getSalesByUser(userId: number): Observable<Invoice[]> {
    return this.http.get<Invoice[]>(`${this.apiUrl}/user/${userId}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Obtener ventas por rango de fechas
   * @param startDate Fecha inicio (YYYY-MM-DD)
   * @param endDate Fecha fin (YYYY-MM-DD)
   * @returns Observable con las ventas en el rango
   */
  getSalesByDateRange(startDate: string, endDate: string): Observable<Invoice[]> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);

    return this.http.get<Invoice[]>(`${this.apiUrl}/date-range`, { params })
      .pipe(catchError(this.handleError));
  }

  /**
   * Obtener detalles específicos de una venta
   * @param invoiceId ID de la factura
   * @returns Observable con los detalles de la venta
   */
  getSaleDetails(invoiceId: number): Observable<InvoiceDetail[]> {
    return this.http.get<InvoiceDetail[]>(`${this.apiUrl}/${invoiceId}/details`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Obtener ventas realizadas hoy
   * @returns Observable con las ventas del día actual
   */
  getTodaySales(): Observable<Invoice[]> {
    return this.http.get<Invoice[]>(`${this.apiUrl}/today`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Obtener ventas de un mes específico
   * @param year Año
   * @param month Mes (1-12)
   * @returns Observable con las ventas del mes
   */
  getMonthSales(year: number, month: number): Observable<Invoice[]> {
    const params = new HttpParams()
      .set('year', year.toString())
      .set('month', month.toString());

    return this.http.get<Invoice[]>(`${this.apiUrl}/month`, { params })
      .pipe(catchError(this.handleError));
  }

  /**
   * Obtener estadísticas generales de ventas
   * @returns Observable con estadísticas de ventas
   */
  getSalesStats(): Observable<any> {
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
