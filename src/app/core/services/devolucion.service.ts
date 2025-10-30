import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface DevolucionRequest {
  idFactura: number;
  motivo: string;
  usuarioDevolucion: string;
}

export interface DevolucionResponse {
  idDevolucion: number;
  idFactura: number;
  numeroFactura: string;
  paymentId: string;
  refundId: string;
  montoDevuelto: number;
  motivo: string;
  estado: 'PENDIENTE' | 'APROBADA' | 'RECHAZADA';
  fechaDevolucion: string;
  usuarioDevolucion: string;
}

@Injectable({
  providedIn: 'root'
})
export class DevolucionService {
  private apiUrl = `${environment.apiUrl}/devoluciones`;

  constructor(private http: HttpClient) {}

  /**
   * Procesar una devolución
   */
  procesarDevolucion(request: DevolucionRequest): Observable<DevolucionResponse> {
    console.log('🔄 Procesando devolución:', request);
    return this.http.post<DevolucionResponse>(`${this.apiUrl}/procesar`, request)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Obtener todas las devoluciones
   */
  obtenerTodasLasDevoluciones(): Observable<DevolucionResponse[]> {
    return this.http.get<DevolucionResponse[]>(this.apiUrl)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Obtener devoluciones de una factura específica
   */
  obtenerDevolucionesPorFactura(idFactura: number): Observable<DevolucionResponse[]> {
    return this.http.get<DevolucionResponse[]>(`${this.apiUrl}/factura/${idFactura}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Obtener devoluciones por estado
   */
  obtenerDevolucionesPorEstado(estado: string): Observable<DevolucionResponse[]> {
    return this.http.get<DevolucionResponse[]>(`${this.apiUrl}/estado/${estado}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Obtener una devolución por ID
   */
  obtenerDevolucionPorId(id: number): Observable<DevolucionResponse> {
    return this.http.get<DevolucionResponse>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Manejo de errores
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Ocurrió un error desconocido';
    
    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del lado del servidor
      if (typeof error.error === 'string') {
        errorMessage = error.error;
      } else if (error.error?.message) {
        errorMessage = error.error.message;
      } else {
        errorMessage = `Error ${error.status}: ${error.message}`;
      }
    }
    
    console.error('❌ Error en DevolucionService:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
