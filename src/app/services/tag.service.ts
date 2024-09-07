import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Tag } from '../interfaces/interfaces-app';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TagService {
  private apiUrl = `${environment.apiUrl}/api/tags`;

  constructor(private http: HttpClient) {}

  obtenerTags(): Observable<Tag[]> {
    return this.http.get<{$id: string, $values: Tag[] }>(this.apiUrl).pipe(
      map(response => response.$values)
    );
  }
}