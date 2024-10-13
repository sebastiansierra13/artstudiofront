import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, forkJoin, map, catchError, throwError, of } from 'rxjs';
import { Producto, ProductoConImagenes } from '../interfaces/interfaces-app';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ServiceProductService {
  private apiUrl = `${environment.apiUrl}/api/productos`;
  constructor(private http: HttpClient) { }


  private mapProductToProductoConImagenes(product: any): ProductoConImagenes {
    let imagenes: string[] = [];
    try {
      if (product.Imagenes) {
        imagenes = JSON.parse(product.Imagenes);
      }
    } catch (e) {
      console.error(`Error parsing Imagenes for product ${product.IdProducto}:`, e);
    }
  
    return {
      idProducto: product.IdProducto,
      nombreProducto: product.NombreProducto,
      idCategoria: product.IdCategoria,
      Imagenes: imagenes,
      DescripcionProducto: product.DescripcionProducto,
      ListPrecios: product.ListPrecios,
      ListTags: product.ListTags,
      CantVendido: product.CantVendido,
      posicion: product.Posicion,
      destacado: product.Destacado,
      idCategoriaNavigation: product.IdCategoriaNavigation,
      idTags: product.IdTags // Añadir esta línea
    };
  }
  
  search(query: string): Observable<ProductoConImagenes[]> {
    const url = `${this.apiUrl}/search`;
    return this.http.get<{ $id: string, $values: any[] }>(url, {
      params: { query: query }, // Cambia `q` por `query`
      responseType: 'json'
    }).pipe(
      map(response => {
        if (response && response.$values) {
          return response.$values.map(product => this.mapProductToProductoConImagenes(product));
        }
        console.error('Respuesta inesperada:', response);
        return [];
      }),
      catchError(error => {
        console.error('Error realizando la búsqueda:', error);
        return throwError(error);
      })
    );
  }
  

  getProducts(): Observable<ProductoConImagenes[]> {
    return this.http.get<{ $id: string, $values: any[] }>(this.apiUrl).pipe(
      map(response => {
        if (response && response.$values) {
          return response.$values.map(product => this.mapProductToProductoConImagenes(product));
        }
        console.error('Respuesta inesperada:', response);
        return [];
      })
    );
  }
  
  getUltimosProductos(): Observable<ProductoConImagenes[]> {
    return this.http.get<{ $id: string, $values: any[] }>(`${this.apiUrl}/ultimos`).pipe(
      map(response => {
        if (response && response.$values) {
          return response.$values.map(product => this.mapProductToProductoConImagenes(product));
        }
        console.error('Respuesta inesperada:', response);
        return [];
      })
    );
  }

  getRelatedProducts(idProducto: number): Observable<ProductoConImagenes[]> {
    return this.http.get<{ $id: string, $values: any[] }>(`${this.apiUrl}/${idProducto}/relacionados`).pipe(
        map(response => {
            if (response && response.$values) {
                return response.$values.map(product => this.mapProductToProductoConImagenes(product));
            }
            console.error('Respuesta inesperada:', response);
            return [];
        })
    );
}



  
  
  getProductByID(idProducto: number): Observable<ProductoConImagenes> {
    const url = `${this.apiUrl}/${idProducto}`;
    return this.http.get<any>(url).pipe(
      map(product => this.mapProductToProductoConImagenes(product))
    );
  }
  
  getProductsByCategory(idCategoria: number): Observable<ProductoConImagenes[]> {
    return this.http.get<{ $id: string, $values: any[] }>(`${this.apiUrl}/categoria/${idCategoria}`).pipe(
      map(response => {
        if (response && response.$values) {
          return response.$values.map(product => this.mapProductToProductoConImagenes(product));
        }
        console.error('Respuesta inesperada:', response);
        return [];
      })
    );
  }
   
  private generateUniqueId(): number {
    return Math.floor(100000 + Math.random() * 900000); // Genera un número de 6 dígitos
}
  agregarProducto(producto: Producto): Observable<Producto> {
    return this.http.post<Producto>(this.apiUrl, producto).pipe(
        catchError(error => {
            if (error.status === 409) {
                // ID en conflicto, intentar con un nuevo ID
                producto.idProducto = this.generateUniqueId();
                return this.agregarProducto(producto); // Reintentar
            }
            return throwError(error);
        })
    );
}


  eliminarProducto(idProducto: number): Observable<void> {
    const url = `${this.apiUrl}/${idProducto}`;
    return this.http.delete<void>(url);
  }

  actualizarProducto(producto: Producto): Observable<Producto> {
    const url = `${this.apiUrl}/${producto.idProducto}`;
    return this.http.put<Producto>(url, producto).pipe(
      catchError(error => {
        console.error('Error actualizando el producto', error);
        return throwError(error);
      })
    );
  }

  getHighlightedProducts(): Observable<ProductoConImagenes[]> {
    const url = `${this.apiUrl}/destacados`;
    return this.http.get<any[]>(url).pipe(
      map(products => products.map(product => this.mapProductToProductoConImagenes(product))),
      catchError(error => {
        console.error('Error fetching highlighted products', error);
        return throwError(error);
      })
    );
  }

  updateHighlightedProducts(products: ProductoConImagenes[]): Observable<any> {
    const updates = products.map(product => this.actualizarProducto({
      idProducto: product.idProducto,
      nombreProducto: product.nombreProducto,
      idCategoria: product.idCategoria,
      imagenes: JSON.stringify(product.Imagenes),
      descripcionProducto: product.DescripcionProducto,
      listPrecios: product.ListPrecios,
      listTags: product.ListPrecios,
      cantVendido: product.CantVendido,
      posicion: product.posicion,
      destacado: product.destacado,
      idCategoriaNavigation: product.idCategoriaNavigation,
      idTags: product.idTags // Añadir esta línea
    }));
    return forkJoin(updates);
  }

  updateProductPositions(updates: any[]): Observable<any> {
    return this.http.put(`${this.apiUrl}/update-positions`, updates).pipe(
      catchError(error => {
        console.error('Error actualizando posiciones de productos', error);
        return throwError(error);
      })
    );
  }

  getAllProducts(): Observable<ProductoConImagenes[]> {
    return this.http.get<{ $id: string, $values: any[] }>(this.apiUrl).pipe(
      map(response => {
        if (response && response.$values) {
          return response.$values.map(product => this.mapProductToProductoConImagenes(product));
        }
        console.error('Respuesta inesperada:', response);
        return [];
      })
    );
  }

}
