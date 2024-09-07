import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AdminGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): Observable<boolean> {
    return this.authService.isAuthenticated().pipe(
      map((response: any) => {
        if (response.authenticated) {
          return true; // Permite el acceso
        } else {
          this.router.navigate(['/login']); // Redirige si no está autenticado
          return false;
        }
      }),
      catchError(() => {
        // Si la solicitud falla (401 o cualquier otro error), redirige al login
        this.router.navigate(['/login']);
        return of(false); // Bloquea el acceso
      })
    );
  }
}
