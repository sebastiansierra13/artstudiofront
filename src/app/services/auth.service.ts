import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/api/auth`; // URL del backend // Asegúrate de que esta URL sea la correcta

  constructor(private http: HttpClient, private router: Router) {}

  // Método de login
  login(user: string, password: string): Observable<any> {
    const credentials = { User: user, Password: password };
    return this.http.post<any>(`${this.apiUrl}/login`, credentials, { withCredentials: true });
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
