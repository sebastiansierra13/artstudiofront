import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = '/api/auth'; // Asegúrate de que esta URL sea la correcta

  constructor(private http: HttpClient, private router: Router) {}

  // Método de login
  login(user: string, password: string): Observable<any> {
    const credentials = { User: user, Password: password };
    return this.http.post<any>(`${this.apiUrl}/login`, credentials);
  }

  // Método para verificar si el administrador está autenticado
  isAuthenticated(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/check-session`, { withCredentials: true })
      .pipe(
        catchError((error) => {
          // Si ocurre un error, devuelve un objeto que indica que no está autenticado
          return of({ authenticated: false });
        })
      );
  }

  // Método para cerrar sesión
  logout(): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/logout`, {}).pipe(
      catchError(error => of({ success: false, message: error }))
    );
  }
}
