import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { Precio } from '../interfaces/interfaces-app';



@Injectable({
  providedIn: 'root'
})
export class PrecioService {
  private apiUrl = `${environment.apiUrl}/api/precios`;

  constructor(private http: HttpClient) { }

  getPrecios(): Observable<Precio[]> {
    return this.http.get<{ $id: string, $values: Precio[] }>(this.apiUrl).pipe(
      map(response => response.$values)
    );
  }

  updatePrecio(precio: Precio): Observable<Precio | null> {
    return this.http.put<Precio>(`${this.apiUrl}/${precio.IdPrecio}`, precio).pipe(
      map(response => {
        console.log('Response from updatePrecio:', response);
        // Si la respuesta es null o undefined, devuelve el objeto original
        return response ? response : precio;
      }),
      catchError(error => {
        console.error('Error en updatePrecio:', error);
        return of(null);
      })
    );
  }
  
  

  addPrecio(precio: Omit<Precio, 'IdPrecio'>): Observable<Precio> {
    return this.http.post<Precio>(this.apiUrl, precio);
  }

  removePrecio(IdPrecio: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${IdPrecio}`);
  }
}