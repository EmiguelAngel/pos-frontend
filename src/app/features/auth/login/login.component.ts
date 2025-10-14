// src/app/features/auth/login/login.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';
import { MESSAGES } from '../../../core/constants/app.constants';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  loading = false;
  errorMessage = '';
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Si ya está autenticado, redirigir según rol
    if (this.authService.isAuthenticated()) {
      this.authService.redirectByRole();
      return;
    }

    // Crear formulario
    this.loginForm = this.fb.group({
      correo: ['', [Validators.required, Validators.email]],
      contrasena: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  /**
   * Obtener controles del formulario para validaciones en el template
   */
  get f() {
    return this.loginForm.controls;
  }

  /**
   * Toggle mostrar/ocultar contraseña
   */
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  /**
   * Submit del formulario de login
   */
  onSubmit(): void {
    // Limpiar mensaje de error
    this.errorMessage = '';

    // Validar formulario
    if (this.loginForm.invalid) {
      this.errorMessage = MESSAGES.LOGIN.REQUIRED;
      this.markFormGroupTouched(this.loginForm);
      return;
    }

    // Activar loading
    this.loading = true;

    const { correo, contrasena } = this.loginForm.value;

    // 🔌 Llamada al servicio de autenticación
    this.authService.login(correo, contrasena).subscribe({
      next: (response) => {
        console.log('Login exitoso:', response);
        this.loading = false;

        // Redirigir según el rol del usuario
        this.authService.redirectByRole();
      },
      error: (error) => {
        console.error('Error en login:', error);
        this.loading = false;
        this.errorMessage = error.message || MESSAGES.LOGIN.ERROR;
      }
    });
  }

  /**
   * Marcar todos los campos del formulario como touched para mostrar errores
   */
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }
}
