// auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, of } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/api/auth`; // URL del backend

  constructor(private http: HttpClient) {}

  // Método para iniciar sesión
  login(user: string, password: string): Observable<any> {
    const adminCredentials = { User: user, Password: password };
    return this.http.post(`${this.apiUrl}/login`, adminCredentials, {
        withCredentials: true // Habilita el envío de credenciales
    });
  }

  // Verifica si la sesión está activa (check-session)
  isAuthenticated(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/check-session`, { withCredentials: true })
      .pipe(
        catchError((error) => {
          // Si ocurre un error, devolver un objeto que indica que no está autenticado
          return of({ authenticated: false });
        })
      );
  }

  // Cierra la sesión eliminando la cookie del lado del servidor
  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/logout`, {}, { withCredentials: true });
  }
}
