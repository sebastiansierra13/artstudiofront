import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class InstagramService {
  private apiUrl = `${environment.apiUrl}/instagram`;

  constructor(private http: HttpClient) {}

  getLatestPosts(): Observable<any[]> {
    return this.http.get<any>(`${this.apiUrl}/latest-posts`).pipe(
      map((response) => {
        console.log('Raw response from API:', response); // Verificar la respuesta cruda
        if (response && Array.isArray(response.$values)) {
          return response.$values;
        } else {
          throw new Error('Formato de respuesta inesperado');
        }
      }),
      catchError((error) => {
        console.error('Error al obtener las publicaciones de Instagram:', error);
        return throwError('Error al obtener las publicaciones de Instagram.');
      })
    );
  }

  initiateInstagramAuth() {
    window.location.href = `${this.apiUrl}/auth`;
  }
}
