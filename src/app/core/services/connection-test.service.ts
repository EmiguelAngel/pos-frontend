// src/app/core/services/connection-test.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ConnectionTestService {
  constructor(private http: HttpClient) { }

  /**
   * Probar conexión con el backend
   */
  testConnection(): Observable<boolean> {
    return this.http.get(`${environment.apiUrl}/status`)
      .pipe(
        map(() => true),
        catchError(() => of(false))
      );
  }

  /**
   * Obtener información del backend
   */
  getBackendInfo(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/status`)
      .pipe(
        catchError(error => {
          console.error('Error conectando al backend:', error);
          return of({ error: 'No se pudo conectar al backend', details: error });
        })
      );
  }

  /**
   * Probar endpoint de productos
   */
  testProductsEndpoint(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/productos`)
      .pipe(
        catchError(error => {
          console.error('Error en endpoint de productos:', error);
          return of({ error: 'Error en productos', details: error });
        })
      );
  }
}
