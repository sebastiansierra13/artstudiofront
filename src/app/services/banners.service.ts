import { Injectable } from '@angular/core';
import { Observable, catchError, map, throwError } from 'rxjs';
import { Banner } from '../interfaces/interfaces-app';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Storage, ref, deleteObject } from '@angular/fire/storage';

@Injectable({
  providedIn: 'root'
})
export class BannersService {
  private apiUrl = `${environment.apiUrl}/api/banner`;
  
  constructor(private http: HttpClient,  private storage: Storage) { }

  getBanners(): Observable<Banner[]> {
    return this.http.get<{ $id: string, $values: Banner[] }>(this.apiUrl).pipe(
      map(response => response.$values)
    );
  }

  // banners.service.ts
    // banners.service.ts
    postBulkBanners(banners: Banner[]): Observable<any> {
      return this.http.post<any>(`${this.apiUrl}/bulk`, banners);
    }
    
  
    private handleError(error: HttpErrorResponse) {
      let errorMessage = 'An unknown error occurred';
      if (error.error instanceof ErrorEvent) {
        // Client-side error
        errorMessage = `Error: ${error.error.message}`;
      } else {
        // Server-side error
        errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
        if (error.error && typeof error.error === 'object') {
          errorMessage += '\nDetails: ' + JSON.stringify(error.error);
        }
      }
      console.error(errorMessage);
      return throwError(() => new Error(errorMessage));
    }


  // Método para actualizar las posiciones de los banners
  updateBannerPositions(banners: { Id: number; Posicion: number; }[]): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/positions`, banners)
      .pipe(
        catchError(this.handleError)
      );
  }
 

  deleteBanner(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  deleteImageFromFirebase(imageUrl: string): Promise<void> {
    const imageRef = ref(this.storage, imageUrl);
    return deleteObject(imageRef);
  }
  
}
