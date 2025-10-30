import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DevolucionService, DevolucionRequest } from '../../../core/services/devolucion.service';
import { Invoice } from '../../../core/models';

@Component({
  selector: 'app-devolucion-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './devolucion-modal.html',
  styleUrls: ['./devolucion-modal.css']
})
export class DevolucionModalComponent {
  @Input() factura: Invoice | null = null;
  @Input() usuarioActual: string = '';
  @Output() close = new EventEmitter<void>();
  @Output() devolucionExitosa = new EventEmitter<void>();

  motivo: string = '';
  isProcessing: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  constructor(private devolucionService: DevolucionService) {}

  get isVisible(): boolean {
    return this.factura !== null;
  }

  get isFormValid(): boolean {
    return this.motivo.trim().length >= 10;
  }

  /**
   * Verifica si el payment_id es válido para Mercado Pago
   */
  esPaymentIdValido(paymentId: string | null | undefined): boolean {
    if (!paymentId || paymentId.trim() === '') {
      return false;
    }

    // Rechazar IDs de prueba
    if (paymentId.startsWith('TEST_') || paymentId.startsWith('test_')) {
      return false;
    }

    // Verificar que sea un número válido
    return !isNaN(Number(paymentId));
  }

  cerrarModal(): void {
    if (!this.isProcessing) {
      this.resetearFormulario();
      this.close.emit();
    }
  }

  procesarDevolucion(): void {
    if (!this.factura || !this.isFormValid || this.isProcessing) {
      return;
    }

    this.isProcessing = true;
    this.errorMessage = '';
    this.successMessage = '';

    const request: DevolucionRequest = {
      idFactura: this.factura.idFactura,
      motivo: this.motivo.trim(),
      usuarioDevolucion: this.usuarioActual || 'Sistema'
    };

    console.log('📤 Enviando solicitud de devolución:', request);

    this.devolucionService.procesarDevolucion(request).subscribe({
      next: (response) => {
        console.log('✅ Devolución procesada exitosamente:', response);
        
        // Mensaje personalizado según si hubo reembolso de MP o no
        if (response.refundId) {
          this.successMessage = `✅ Devolución procesada con reembolso de Mercado Pago. Refund ID: ${response.refundId}`;
        } else {
          this.successMessage = `✅ Devolución procesada exitosamente. Inventario restaurado.`;
        }
        
        // Esperar 1.5 segundos antes de cerrar para mostrar el mensaje
        setTimeout(() => {
          console.log('🔄 Emitiendo evento devolucionExitosa...');
          this.devolucionExitosa.emit();
          this.cerrarModal();
        }, 1500);
      },
      error: (error) => {
        console.error('❌ Error al procesar devolución:', error);
        this.errorMessage = error.message || 'Error al procesar la devolución';
        this.isProcessing = false;
      },
      complete: () => {
        console.log('✓ Observable completado');
      }
    });
  }

  private resetearFormulario(): void {
    this.motivo = '';
    this.isProcessing = false;
    this.errorMessage = '';
    this.successMessage = '';
  }

  // Cerrar modal al hacer clic fuera
  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.cerrarModal();
    }
  }
}
