// src/app/core/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { User, AuthResponse, LoginRequest } from '../models';
import { StorageService } from './storage.service';
import { ROUTES } from '../constants/app.constants';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser$: Observable<User | null>;

  constructor(
    private http: HttpClient,
    private router: Router,
    private storage: StorageService
  ) {
    // Inicializar con usuario de localStorage si existe
    const storedUser = this.storage.getItem<User>(environment.userKey);
    this.currentUserSubject = new BehaviorSubject<User | null>(storedUser);
    this.currentUser$ = this.currentUserSubject.asObservable();
  }

  /**
   * Obtener el valor actual del usuario
   */
  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * ========================================
   * 🔌 LOGIN - CONECTA TU API AQUÍ
   * ========================================
   */
  login(correo: string, contrasena: string): Observable<AuthResponse> {
    const loginData: LoginRequest = { correo, contrasena };

    // 🔌 REEMPLAZA ESTO CON TU LLAMADA API REAL
    // Ejemplo:
    // return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, loginData)

    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, loginData)
      .pipe(
        tap(response => {
          // Guardar token si viene en la respuesta
          if (response.token) {
            this.storage.setItem(environment.tokenKey, response.token);
          }

          // Guardar usuario
          this.storage.setItem(environment.userKey, response.user);

          // Actualizar subject
          this.currentUserSubject.next(response.user);
        }),
        catchError(error => {
          console.error('Error en login:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * ========================================
   * 🔌 LOGOUT - CONECTA TU API AQUÍ (opcional)
   * ========================================
   */
  logout(): void {
    // 🔌 Si tu backend tiene endpoint de logout, descomenta esto:
    // this.http.post(`${this.apiUrl}/auth/logout`, {}).subscribe();

    // Limpiar localStorage
    this.storage.removeItem(environment.tokenKey);
    this.storage.removeItem(environment.userKey);

    // Limpiar subject
    this.currentUserSubject.next(null);

    // Redirigir a login
    this.router.navigate([ROUTES.LOGIN]);
  }

  /**
   * ========================================
   * 🔌 GET CURRENT USER - CONECTA TU API AQUÍ (opcional)
   * ========================================
   */
  getCurrentUserFromApi(): Observable<User> {
    // 🔌 Si tu backend tiene endpoint para obtener usuario actual
    // return this.http.get<User>(`${this.apiUrl}/auth/me`);

    // Por ahora devuelve del localStorage
    const user = this.currentUserValue;
    return user ? of(user) : throwError(() => new Error('No user logged in'));
  }

  /**
   * Verificar si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    const token = this.storage.getItem(environment.tokenKey);
    const user = this.currentUserValue;
    return !!(token && user);
  }

  /**
   * Obtener token actual
   */
  getToken(): string | null {
    return this.storage.getItem<string>(environment.tokenKey);
  }

  /**
   * Obtener usuario actual (desde localStorage/memory)
   */
  getCurrentUser(): User | null {
    return this.currentUserValue;
  }

  /**
   * Obtener rol del usuario actual
   */
  getUserRole(): number | null {
    const user = this.getCurrentUser();
    return user ? user.idRol : null;
  }

  /**
   * Verificar si el usuario tiene un rol específico
   */
  hasRole(roleId: number): boolean {
    return this.getUserRole() === roleId;
  }

  /**
   * Verificar si es administrador
   */
  isAdmin(): boolean {
    return this.getUserRole() === 1; // ROLES.ADMIN
  }

  /**
   * Verificar si es cajero
   */
  isCajero(): boolean {
    return this.getUserRole() === 2; // ROLES.CAJERO
  }

  /**
   * Redirigir según el rol del usuario
   */
  redirectByRole(): void {
    const role = this.getUserRole();

    if (role === 1) { // Admin
      this.router.navigate([ROUTES.ADMIN.DASHBOARD]);
    } else if (role === 2) { // Cajero
      this.router.navigate([ROUTES.CAJERO.POS]);
    } else {
      this.router.navigate([ROUTES.LOGIN]);
    }
  }
}
