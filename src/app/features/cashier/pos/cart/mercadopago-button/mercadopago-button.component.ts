import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MercadoPagoService } from '../../../../../core/services/mercadopago.service';

declare global {
  interface Window {
    MercadoPago: any;
  }
}

@Component({
  selector: 'app-mercadopago-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="mercadopago-container">
      <div class="mp-header">
        <h3>💳 Pagar con tarjeta vía Mercado Pago</h3>
      </div>
      <div id="mercadopago-button" class="mp-button-container">
        <div class="mp-button-placeholder" *ngIf="!isButtonLoaded">
          <p *ngIf="!errorMessage">⏳ Cargando opciones de pago...</p>
          <p *ngIf="errorMessage" style="color: red; font-size: 12px;">❌ {{errorMessage}}</p>
          <button *ngIf="errorMessage" (click)="retryInit()" style="margin-top: 10px; padding: 8px 16px; cursor: pointer;">
            🔄 Reintentar
          </button>
        </div>
      </div>
      <div class="mp-debug" *ngIf="showDebug">
        <p><strong>Debug Info:</strong></p>
        <p style="font-weight: bold; color: blue;">Items recibidos: {{items.length}}</p>
        <p>Total: {{total}}</p>
        <p>Button loaded: {{isButtonLoaded}}</p>
        <p *ngIf="debugInfo">{{debugInfo}}</p>
        <p *ngIf="errorMessage" style="color: red;">Error: {{errorMessage}}</p>
      </div>
    </div>
  `,
  styles: [`
    .mercadopago-container {
      margin-top: 20px;
      padding: 20px;
      border-top: 1px solid #eee;
      background-color: #f8f9fa;
      border-radius: 8px;
    }
    .mp-header {
      display: flex;
      align-items: center;
      margin-bottom: 20px;
    }
    .mp-logo {
      height: 24px;
      margin-right: 10px;
    }
    h3 {
      color: #333;
      margin: 0;
      font-size: 1.1em;
    }
    .mp-button-container {
      width: 100%;
      min-height: 48px;
      background-color: white;
      border-radius: 4px;
      padding: 10px;
    }
    .mp-button-placeholder {
      text-align: center;
      color: #666;
      padding: 10px;
    }
    .mp-debug {
      margin-top: 10px;
      padding: 10px;
      background-color: #fff3cd;
      border: 1px solid #ffc107;
      border-radius: 4px;
      font-size: 0.9em;
    }
    .mp-debug p {
      margin: 5px 0;
    }
  `]
})
export class MercadoPagoButtonComponent implements OnInit, OnChanges {
  @Input() items: any[] = [];
  @Input() total: number = 0;
  isButtonLoaded = false;
  showDebug = true; // Cambia a false en producción
  errorMessage = '';
  debugInfo = '';

  constructor(private mercadoPagoService: MercadoPagoService) {}

  ngOnInit() {
    console.log('=== 🔵 MercadoPago Button Component initialized ===');
    console.log('Items received on init:', this.items);
    console.log('Items count on init:', this.items.length);
    console.log('Items FULL DETAILS:', JSON.stringify(this.items, null, 2));
    this.initMercadoPago();
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log('=== 🟠 MercadoPago Button - Changes detected ===');
    console.log('All changes:', changes);
    
    if (changes['items']) {
      console.log('📦 Items property changed!');
      console.log('  - First change?:', changes['items'].firstChange);
      console.log('  - Previous value:', changes['items'].previousValue);
      console.log('  - Current value:', changes['items'].currentValue);
      console.log('  - Current items array:', this.items);
      console.log('  - Current items count:', this.items ? this.items.length : 0);
      
      if (!changes['items'].firstChange) {
        console.log('♻️ Re-initializing MercadoPago button...');
        
        // Re-inicializar cuando cambien los items
        this.isButtonLoaded = false;
        this.errorMessage = '';
        this.debugInfo = '';
        
        // Limpiar el contenedor del botón
        const container = document.getElementById('mercadopago-button');
        if (container) {
          container.innerHTML = '<div class="mp-button-placeholder"><p>⏳ Actualizando opciones de pago...</p></div>';
        }
        
        // Re-inicializar después de un pequeño delay
        setTimeout(() => {
          console.log('🔄 Ejecutando initMercadoPago() después del cambio...');
          this.initMercadoPago();
        }, 100);
      }
    }
    
    // También detectar cambios en el total (indica que el carrito cambió)
    if (changes['total'] && !changes['total'].firstChange) {
      console.log('💰 Total changed!');
      console.log('  - Previous total:', changes['total'].previousValue);
      console.log('  - Current total:', changes['total'].currentValue);
      console.log('  - Current items count:', this.items ? this.items.length : 0);
      
      // Si el total cambió pero no hay cambio de items, forzar re-inicialización
      if (!changes['items'] && this.items && this.items.length > 0) {
        console.log('⚠️ Total cambió pero items no - forzando re-inicialización...');
        this.isButtonLoaded = false;
        setTimeout(() => {
          this.initMercadoPago();
        }, 100);
      }
    }
  }

  retryInit() {
    this.errorMessage = '';
    this.debugInfo = 'Reintentando...';
    this.initMercadoPago();
  }

  private async initMercadoPago() {
    console.log('Initializing MercadoPago...');
    console.log('Items received:', this.items);
    
    if (!this.items || this.items.length === 0) {
      console.log('No items in cart, skipping MercadoPago initialization');
      this.debugInfo = 'No hay items en el carrito';
      return;
    }

    // Verificar si window.MercadoPago está disponible
    if (!window.MercadoPago) {
      console.error('MercadoPago SDK not loaded!');
      this.errorMessage = 'SDK de MercadoPago no cargado';
      this.debugInfo = 'Verifica que el script de MP esté en index.html';
      return;
    }

    this.debugInfo = 'Formateando items...';

    try {
      console.log('🔵 === INICIANDO FORMATO DE ITEMS ===');
      console.log('📦 this.items (ANTES de mapear):', this.items);
      console.log('📊 this.items.length:', this.items.length);
      console.log('🔍 this.items completo:', JSON.stringify(this.items, null, 2));
      
      // Transformar items del carrito al formato esperado por el servicio
      const formattedItems = this.items.map((item, index) => {
        console.log(`\n--- Procesando item ${index + 1}/${this.items.length} ---`);
        console.log('Item original:', item);
        const name = item.product?.descripcion || item.name || 'Producto';
        const quantity = item.quantity || 1;
        const precioBase = item.product?.precioUnitario || item.price || 0;
        
        // Calcular precio CON IVA (19% en Colombia)
        const IVA_RATE = 0.19;
        const precioConIVA = Math.round(precioBase * (1 + IVA_RATE));
        
        console.log(`  ✅ Mapeado - name: ${name}, quantity: ${quantity}, precioBase: ${precioBase}, precioConIVA: ${precioConIVA}`);
        
        const formattedItem = {
          name: name,
          quantity: quantity,
          price: Number(precioConIVA)
        };
        console.log('  📦 Item formateado:', formattedItem);
        return formattedItem;
      });

      console.log('\n✅ === MAPEO COMPLETADO ===');
      console.log('📊 formattedItems.length:', formattedItems.length);
      console.log('📤 Formatted items for MercadoPago (CON IVA):', formattedItems);
      console.log('🔍 formattedItems completo:', JSON.stringify(formattedItems, null, 2));
      this.debugInfo = `Enviando ${formattedItems.length} items al backend...`;
      console.log('Calling API URL:', `${window.location.origin}/api/payments/create-preference`);
      
      // Guardar items en localStorage antes de crear la preferencia
      localStorage.setItem('mp_cart_items', JSON.stringify(this.items));
      console.log('Items guardados en localStorage para recuperar después del pago');
      
      const response = await this.mercadoPagoService.createPreference(formattedItems).toPromise();
      console.log('Preference created successfully:', response);
      this.debugInfo = 'Preferencia creada, inicializando botón...';
      
      if (!response) {
        console.error('No response received from backend');
        this.errorMessage = 'Sin respuesta del backend';
        this.debugInfo = 'El backend no devolvió datos';
        return;
      }

      if (!response.preferenceId) {
        console.error('No preferenceId in response:', response);
        this.errorMessage = 'Sin preferenceId en la respuesta';
        this.debugInfo = JSON.stringify(response);
        return;
      }
      
      console.log('MercadoPago SDK found, initializing with preferenceId:', response.preferenceId);
      this.debugInfo = `Inicializando con preferenceId: ${response.preferenceId.substring(0, 10)}...`;
      
      // Redirigir directamente al Checkout Pro de Mercado Pago
      const checkoutUrl = `https://www.mercadopago.com.co/checkout/v1/redirect?pref_id=${response.preferenceId}`;
      console.log('Redirigiendo a Checkout Pro:', checkoutUrl);
      
      this.isButtonLoaded = true;
      this.debugInfo = '✅ Listo para pagar';
      
      // Crear un botón personalizado con instrucciones claras
      const buttonContainer = document.getElementById('mercadopago-button');
      if (buttonContainer) {
        buttonContainer.innerHTML = `
          <div style="text-align: center;">
            <button 
              onclick="window.location.href='${checkoutUrl}'" 
              style="
                background-color: #009ee3;
                color: white;
                border: none;
                border-radius: 6px;
                padding: 12px 24px;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
                width: 100%;
                transition: background-color 0.3s;
                margin-bottom: 12px;
              "
              onmouseover="this.style.backgroundColor='#0089c7'"
              onmouseout="this.style.backgroundColor='#009ee3'"
            >
              💳 Pagar con Mercado Pago
            </button>
            <div style="background: #fff3cd; border: 1px solid #ffc107; border-radius: 6px; padding: 12px; font-size: 13px; text-align: left;">
              <strong style="display: block; margin-bottom: 8px;">📝 Instrucciones:</strong>
              <ol style="margin: 0; padding-left: 20px; line-height: 1.6;">
                <li>Haz clic en el botón azul de arriba</li>
                <li>Completa el pago en Mercado Pago</li>
                <li><strong>Después del pago, vuelve a esta pestaña</strong></li>
                <li>Haz clic en el botón "Completar Venta" que aparecerá aquí</li>
              </ol>
              <p style="margin: 8px 0 0 0; font-size: 12px; color: #856404;">
                💡 <em>No cierres esta ventana del navegador</em>
              </p>
            </div>
          </div>
        `;
      }
    } catch (error: any) {
      console.error('Error completo:', error);
      console.error('Error status:', error.status);
      console.error('Error error:', error.error);
      
      let errorMsg = 'Error desconocido';
      let debugMsg = '';
      
      if (error.status === 0) {
        errorMsg = 'No se pudo conectar al backend';
        debugMsg = `Verifica que el backend esté corriendo en http://localhost:8080`;
      } else if (error.status === 400) {
        errorMsg = 'Solicitud inválida';
        // Intentar obtener el mensaje del backend
        if (error.error?.message) {
          debugMsg = error.error.message;
        } else if (typeof error.error === 'string') {
          debugMsg = error.error;
        } else {
          debugMsg = JSON.stringify(error.error);
        }
      } else if (error.status) {
        errorMsg = `Error HTTP ${error.status}`;
        debugMsg = error.error?.message || error.message || JSON.stringify(error.error);
      } else if (error.message) {
        errorMsg = error.message;
        debugMsg = error.stack || '';
      }
      
      this.errorMessage = errorMsg;
      this.debugInfo = debugMsg;
      
      console.error('Error al inicializar MercadoPago:', errorMsg);
      console.error('Debug info:', debugMsg);
    }
  }
}