// src/app/core/services/user.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';

import { environment } from '../../../environments/environment';
import { User } from '../models';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/users`; // 🔧 Ajusta la ruta según tu API

  constructor(private http: HttpClient) { }

  /**
   * ========================================
   * 🔌 OBTENER TODOS LOS USUARIOS
   * ========================================
   */
  getUsers(): Observable<User[]> {
    // 🔌 CONECTA TU API AQUÍ
    return this.http.get<User[]>(this.apiUrl)
      .pipe(catchError(this.handleError));
  }

  /**
   * ========================================
   * 🔌 OBTENER USUARIO POR ID
   * ========================================
   */
  getUserById(id: number): Observable<User> {
    // 🔌 CONECTA TU API AQUÍ
    return this.http.get<User>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * ========================================
   * 🔌 CREAR USUARIO
   * ========================================
   */
  createUser(user: User): Observable<User> {
    // 🔌 CONECTA TU API AQUÍ
    return this.http.post<User>(this.apiUrl, user)
      .pipe(catchError(this.handleError));
  }

  /**
   * ========================================
   * 🔌 ACTUALIZAR USUARIO
   * ========================================
   */
  updateUser(id: number, user: User): Observable<User> {
    // 🔌 CONECTA TU API AQUÍ
    return this.http.put<User>(`${this.apiUrl}/${id}`, user)
      .pipe(catchError(this.handleError));
  }

  /**
   * ========================================
   * 🔌 ELIMINAR USUARIO
   * ========================================
   */
  deleteUser(id: number): Observable<void> {
    // 🔌 CONECTA TU API AQUÍ
    return this.http.delete<void>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * ========================================
   * 🔌 OBTENER USUARIOS POR ROL
   * ========================================
   */
  getUsersByRole(roleId: number): Observable<User[]> {
    // 🔌 CONECTA TU API AQUÍ
    const params = new HttpParams().set('roleId', roleId.toString());
    return this.http.get<User[]>(`${this.apiUrl}/role/${roleId}`, { params })
      .pipe(catchError(this.handleError));
  }

  /**
   * ========================================
   * 🔌 BUSCAR USUARIOS
   * ========================================
   */
  searchUsers(searchTerm: string): Observable<User[]> {
    // 🔌 CONECTA TU API AQUÍ
    const params = new HttpParams().set('q', searchTerm);
    return this.http.get<User[]>(`${this.apiUrl}/search`, { params })
      .pipe(catchError(this.handleError));
  }

  /**
   * Manejo centralizado de errores
   */
  private handleError(error: any): Observable<never> {
    console.error('Error en UserService:', error);

    let errorMessage = 'Ocurrió un error al procesar la solicitud';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = error.error?.message || `Error ${error.status}: ${error.message}`;
    }

    return throwError(() => new Error(errorMessage));
  }
}
