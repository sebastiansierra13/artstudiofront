import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PayUService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  createPaymentForm(orderData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/payu/createPaymentForm`, orderData);
  }

  handlePayUResponse(responseData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/payu/response`, responseData);
  }

  handlePayUConfirmation(confirmationData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/payu/confirmation`, confirmationData);
  }
}
