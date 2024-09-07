import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Departamento, Municipio, Region } from '../interfaces/interfaces-app';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  private apiUrl = `${environment.apiUrl}`;
  private headers = new HttpHeaders().set('Accept', 'application/json; charset=utf-8');

  constructor(private http: HttpClient) {}

  private fixEncoding(text: string): string {
  if (!text) return text;

  const fixes: { [key: string]: string } = {
    '├í': 'á', '├®': 'é', '├¡': 'í', '├│': 'ó', '├║': 'ú',
    '├ü': 'Á', '├ë': 'É', '├ì': 'Í', '├ô': 'Ó', '├Ü': 'Ú',
    '├▒': 'ñ', '├æ': 'Ñ'
  };

  let fixedText = text;

  // Reemplazar caracteres conocidos
  Object.keys(fixes).forEach(key => {
    fixedText = fixedText.replace(new RegExp(key, 'g'), fixes[key]);
  });

  // Eliminar caracteres no imprimibles
  fixedText = fixedText.replace(/[^\x20-\x7E\xA0-\xFF]/g, '');

  return fixedText.trim();
}

  getRegions(): Observable<Region[]> {
    return this.http.get<{$id: string, $values: Region[]}>(`${this.apiUrl}/api/regions`, { headers: this.headers }).pipe(
      map(response => response.$values.map(region => ({ ...region, Nombre: this.fixEncoding(region.Nombre) })))
    );
  }

  getDepartments(): Observable<Departamento[]> {
    return this.http.get<{$id: string, $values: Departamento[]}>(`${this.apiUrl}/api/departments`, { headers: this.headers }).pipe(
      map(response => response.$values.map(department => ({ ...department, Nombre: this.fixEncoding(department.Nombre) })))
    );
  }

  getMunicipalities(): Observable<Municipio[]> {
    return this.http.get<{$id: string, $values: Municipio[]}>(`${this.apiUrl}/api/municipalities`, { headers: this.headers }).pipe(
      map(response => response.$values.map(municipality => ({ ...municipality, Nombre: this.fixEncoding(municipality.Nombre) })))
    );
  }
}