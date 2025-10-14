// src/app/features/admin/users/user-list/user-list.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { NavbarComponent } from '../../../../shared/components/navbar/navbar';
import { SidebarComponent } from '../../../../shared/components/sidebar/sidebar';
import { UserService } from '../../../../core/services/user.service';
import { AuthService } from '../../../../core/services/auth.service';
import { User, Role } from '../../../../core/models';
import { ROLES, ROLE_NAMES, MESSAGES } from '../../../../core/constants/app.constants';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent, SidebarComponent],
  templateUrl: './user-list.html',
  styleUrls: ['./user-list.css']
})
export class UserListComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];

  // Filtros
  searchTerm = '';
  selectedRole: number | null = null;

  // Modal
  showModal = false;
  isEditMode = false;
  currentUser: User = this.getEmptyUser();

  // Estados
  loading = true;
  error = '';
  successMessage = '';

  // Confirmación
  showDeleteConfirm = false;
  userToDelete: User | null = null;

  // Roles disponibles
  roles = [
    { id: ROLES.ADMIN, name: ROLE_NAMES[ROLES.ADMIN] },
    { id: ROLES.CAJERO, name: ROLE_NAMES[ROLES.CAJERO] }
  ];

  constructor(
    private userService: UserService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  /**
   * 🔌 Cargar usuarios
   */
  loadUsers(): void {
    this.loading = true;
    this.error = '';

    this.userService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.filteredUsers = users;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando usuarios:', err);
        this.error = 'Error al cargar usuarios. Verifica tu conexión con el API.';
        this.loading = false;
      }
    });
  }

  /**
   * Filtrar usuarios
   */
  filterUsers(): void {
    let filtered = this.users;

    // Filtro por búsqueda
    if (this.searchTerm.trim()) {
      const search = this.searchTerm.toLowerCase();
      filtered = filtered.filter(u =>
        u.nombre.toLowerCase().includes(search) ||
        u.correo.toLowerCase().includes(search)
      );
    }

    // Filtro por rol
    if (this.selectedRole !== null) {
      filtered = filtered.filter(u => u.idRol === this.selectedRole);
    }

    this.filteredUsers = filtered;
  }

  /**
   * Limpiar filtros
   */
  clearFilters(): void {
    this.searchTerm = '';
    this.selectedRole = null;
    this.filteredUsers = this.users;
  }

  /**
   * Abrir modal para crear
   */
  openCreateModal(): void {
    this.isEditMode = false;
    this.currentUser = this.getEmptyUser();
    this.showModal = true;
  }

  /**
   * Abrir modal para editar
   */
  openEditModal(user: User): void {
    this.isEditMode = true;
    this.currentUser = { ...user };
    // No mostrar contraseña al editar
    this.currentUser.contrasena = '';
    this.showModal = true;
  }

  /**
   * Cerrar modal
   */
  closeModal(): void {
    this.showModal = false;
    this.currentUser = this.getEmptyUser();
  }

  /**
   * 🔌 Guardar usuario
   */
  saveUser(): void {
    if (!this.validateUser()) {
      return;
    }

    if (this.isEditMode) {
      // Actualizar
      this.userService.updateUser(
        this.currentUser.idUsuario,
        this.currentUser
      ).subscribe({
        next: () => {
          this.showSuccess(MESSAGES.USER.UPDATED);
          this.loadUsers();
          this.closeModal();
        },
        error: (err) => {
          console.error('Error actualizando usuario:', err);
          this.showError(MESSAGES.USER.ERROR);
        }
      });
    } else {
      // Crear
      this.userService.createUser(this.currentUser).subscribe({
        next: () => {
          this.showSuccess(MESSAGES.USER.CREATED);
          this.loadUsers();
          this.closeModal();
        },
        error: (err) => {
          console.error('Error creando usuario:', err);
          this.showError(MESSAGES.USER.ERROR);
        }
      });
    }
  }

  /**
   * Confirmar eliminación
   */
  confirmDelete(user: User): void {
    // No permitir eliminar al usuario actual
    const currentUser = this.authService.getCurrentUser();
    if (currentUser && currentUser.idUsuario === user.idUsuario) {
      this.showError('No puedes eliminar tu propio usuario');
      return;
    }

    this.userToDelete = user;
    this.showDeleteConfirm = true;
  }

  /**
   * Cancelar eliminación
   */
  cancelDelete(): void {
    this.userToDelete = null;
    this.showDeleteConfirm = false;
  }

  /**
   * 🔌 Eliminar usuario
   */
  deleteUser(): void {
    if (!this.userToDelete) return;

    this.userService.deleteUser(this.userToDelete.idUsuario).subscribe({
      next: () => {
        this.showSuccess(MESSAGES.USER.DELETED);
        this.loadUsers();
        this.cancelDelete();
      },
      error: (err) => {
        console.error('Error eliminando usuario:', err);
        this.showError(MESSAGES.USER.ERROR);
        this.cancelDelete();
      }
    });
  }

  /**
   * Validar usuario
   */
  validateUser(): boolean {
    if (!this.currentUser.nombre.trim()) {
      this.showError('El nombre es requerido');
      return false;
    }
    if (!this.currentUser.correo.trim()) {
      this.showError('El correo es requerido');
      return false;
    }
    if (!this.validateEmail(this.currentUser.correo)) {
      this.showError('El correo no es válido');
      return false;
    }
    if (!this.isEditMode && !this.currentUser.contrasena) {
      this.showError('La contraseña es requerida');
      return false;
    }
    if (this.currentUser.contrasena && this.currentUser.contrasena.length < 6) {
      this.showError('La contraseña debe tener al menos 6 caracteres');
      return false;
    }
    if (!this.currentUser.idRol) {
      this.showError('El rol es requerido');
      return false;
    }
    return true;
  }

  /**
   * Validar email
   */
  validateEmail(email: string): boolean {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  /**
   * Obtener usuario vacío
   */
  getEmptyUser(): User {
    return {
      idUsuario: 0,
      nombre: '',
      correo: '',
      contrasena: '',
      telefono: '',
      idRol: ROLES.CAJERO
    };
  }

  /**
   * Obtener nombre del rol
   */
  getRoleName(idRol: number): string {
    return ROLE_NAMES[idRol as keyof typeof ROLE_NAMES] || '';
  }

  /**
   * Mostrar mensaje de éxito
   */
  showSuccess(message: string): void {
    this.successMessage = message;
    setTimeout(() => {
      this.successMessage = '';
    }, 3000);
  }

  /**
   * Mostrar mensaje de error
   */
  showError(message: string): void {
    this.error = message;
    setTimeout(() => {
      this.error = '';
    }, 3000);
  }
}
