import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, map, Observable, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { OrderDetails, PayUResponse } from '../interfaces/interfaces-app';

@Injectable({
  providedIn: 'root'
})
export class PayUService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  // Método para crear el pedido en el backend
  createOrder(orderData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/payu/createOrder`, orderData);
  }

  createPaymentForm(orderData: any): Observable<any> {
    // Enviar los datos del pedido al backend
    return this.http.post(`${this.apiUrl}/api/payu/createPaymentForm`, orderData);
    
  }

  // Manejar la confirmación de PayU
  handlePayUConfirmation(confirmationData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/payu/confirmation`, confirmationData);
  }

  // Obtener detalles de la orden
  getOrderDetails(referenceCode: string): Observable<OrderDetails> {
    console.log('Llamada a getOrderDetails con referenceCode:', referenceCode);  // Confirmamos que el método se ejecuta
    
    return this.http.get<OrderDetails>(`${this.apiUrl}/api/payu/order-details?referenceCode=${referenceCode}`).pipe(
      map(response => {
        console.log('Respuesta recibida del backend:', response);  // Verificamos la respuesta del backend
        if (response && response.Products) {
          return response;  // Retornamos el objeto completo
        } else {
          console.error('No se encontraron productos en la respuesta.');
          throw new Error('No se encontraron productos en el pedido.');
        }
      }),
      catchError(error => {
        console.error('Error al obtener los detalles del pedido:', error);  // Depuramos si hay algún error
        return throwError(() => new Error('Error en la solicitud para obtener los detalles del pedido.'));
      })
    );
  }
  
}
