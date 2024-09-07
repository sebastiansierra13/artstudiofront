import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BlogService {
  private baseUrl = 'assets/blogs/';

  constructor(private http: HttpClient) {}

  getBlogs(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}blogs.json`);
  }

  getBlogById(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}${id}.json`);
  }
}
