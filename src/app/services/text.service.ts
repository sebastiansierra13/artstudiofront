import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, tap } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TextService {
  private apiUrl = `${environment.apiUrl}/api/configurationtext`;

  constructor(private http: HttpClient) {}

  // Obtener el texto de una sección específica
  getText(section: string): Observable<string> {
    return this.http.get<any>(`${this.apiUrl}/${section}`).pipe(
      map(response => {
        if (response && response.TextContent) {
          return response.TextContent;
        } else {
          console.error(`Unexpected response structure for ${section}:`, response);
          return '';
        }
      })
    );
  }

  // Guardar o actualizar el texto de una sección específica
  saveText(section: string, textContent: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${section}`, { section, textContent });
  }
}
