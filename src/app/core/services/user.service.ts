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
  private apiUrl = `${environment.apiUrl}/usuarios`; // Conectado a /api/usuarios del backend

  constructor(private http: HttpClient) { }

  /**
   * Obtener todos los usuarios del sistema
   * @returns Observable con array de usuarios
   */
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl)
      .pipe(catchError(this.handleError));
  }

  /**
   * Obtener un usuario específico por su ID
   * @param id Identificador del usuario
   * @returns Observable con los datos del usuario
   */
  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Crear un nuevo usuario en el sistema
   * @param user Datos del usuario a crear
   * @returns Observable con el usuario creado
   */
  createUser(user: User): Observable<User> {
    return this.http.post<User>(this.apiUrl, user)
      .pipe(catchError(this.handleError));
  }

  /**
   * Actualizar datos de un usuario existente
   * @param id ID del usuario a actualizar
   * @param user Nuevos datos del usuario
   * @returns Observable con el usuario actualizado
   */
  updateUser(id: number, user: User): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, user)
      .pipe(catchError(this.handleError));
  }

  /**
   * Eliminar un usuario del sistema
   * @param id ID del usuario a eliminar
   * @returns Observable vacío
   */
  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Obtener usuarios filtrados por rol
   * @param roleId ID del rol a filtrar
   * @returns Observable con usuarios del rol especificado
   */
  getUsersByRole(roleId: number): Observable<User[]> {
    const params = new HttpParams().set('roleId', roleId.toString());
    return this.http.get<User[]>(`${this.apiUrl}/role/${roleId}`, { params })
      .pipe(catchError(this.handleError));
  }

  /**
   * Buscar usuarios por término de búsqueda
   * @param searchTerm Término a buscar en nombre o email
   * @returns Observable con usuarios que coinciden con la búsqueda
   */
  searchUsers(searchTerm: string): Observable<User[]> {
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
