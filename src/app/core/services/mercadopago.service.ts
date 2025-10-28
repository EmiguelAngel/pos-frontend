import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MercadoPagoService {
  private apiUrl = `${environment.apiUrl}/payments`;

  constructor(private http: HttpClient) {}

  createPreference(items: any[]): Observable<any> {
    console.log('🔵 === MercadoPagoService.createPreference() ===');
    console.log('📦 Items recibidos en el servicio:', items);
    console.log('📊 Cantidad de items recibidos:', items.length);
    console.log('🔍 Items detallados (JSON):', JSON.stringify(items, null, 2));
    
    // Verificación adicional
    if (!Array.isArray(items)) {
      console.error('❌ ERROR: items NO es un array!', typeof items);
      throw new Error('Items debe ser un array');
    }
    
    if (items.length === 0) {
      console.error('❌ ERROR: items está vacío!');
      throw new Error('Items no puede estar vacío');
    }
    
    const mappedItems = items.map((item, index) => {
      console.log(`\n  🔸 Mapeando item ${index + 1}/${items.length}:`);
      console.log('    Input:', item);
      
      const mapped = {
        title: item.name || 'Producto',
        quantity: item.quantity || 1,
        unitPrice: Number(parseFloat(item.price).toFixed(2)), // Precio en COP con IVA
        currencyId: 'COP', // Moneda colombiana
        description: `${item.name} - Cantidad: ${item.quantity}`
      };
      
      console.log('    Output:', mapped);
      return mapped;
    });
    
    console.log('\n✅ === MAPEO COMPLETADO ===');
    console.log('📊 mappedItems.length:', mappedItems.length);
    console.log('📦 mappedItems:', mappedItems);
    
    const baseUrl = window.location.origin;
    
    const payload = {
      items: mappedItems,
      externalReference: `VENTA-${Date.now()}`,
      backUrls: {
        success: `${baseUrl}/cashier/pos?payment=success`,
        pending: `${baseUrl}/cashier/pos?payment=pending`,
        failure: `${baseUrl}/cashier/pos?payment=failure`
      }
      // autoReturn NO incluido - MP rechaza localhost con autoReturn
      // Pero SÍ acepta backUrls con localhost para mostrar botón "Volver"
    };
    
    console.log('✅ Payload.items.length:', payload.items.length);
    console.log('🔗 backUrls configuradas:', payload.backUrls);
    console.log('📤 Payload completo a enviar:', JSON.stringify(payload, null, 2));
    console.log('🌐 Enviando POST a:', `${this.apiUrl}/create-preference`);
    
    return this.http.post(`${this.apiUrl}/create-preference`, payload);
  }

  processPayment(paymentId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/process-payment/${paymentId}`);
  }
}