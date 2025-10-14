// src/app/shared/components/navbar/navbar.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models';
import { ROLE_NAMES } from '../../../core/constants/app.constants';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css']
})
export class NavbarComponent implements OnInit {
  currentUser: User | null = null;
  showUserMenu = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Obtener usuario actual
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  /**
   * Obtener nombre del rol
   */
  getRoleName(): string {
    if (!this.currentUser) return '';
    return ROLE_NAMES[this.currentUser.idRol as keyof typeof ROLE_NAMES] || '';
  }

  /**
   * Toggle menú de usuario
   */
  toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
  }

  /**
   * Cerrar menú de usuario (al hacer click fuera)
   */
  closeUserMenu(): void {
    this.showUserMenu = false;
  }

  /**
   * Logout
   */
  logout(): void {
    this.authService.logout();
  }
}
