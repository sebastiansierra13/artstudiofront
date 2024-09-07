import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Categoria, Producto, ProductoConImagenes } from '../interfaces/interfaces-app';

@Injectable({
  providedIn: 'root'
})
export class CategoriaService {
  private apiUrl = `${environment.apiUrl}/api/categorias`;
  private apiUrlProductos = `${environment.apiUrl}/api/productos`;

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
      idCategoriaNavigation: product.IdCategoriaNavigation
    };
  }

  private mapCategoria(categoria: any): Categoria {
    return {
      idCategoria: categoria.IdCategoria,
      nombreCategoria: categoria.NombreCategoria,
      imagenCategoria: categoria.ImagenCategoria,
      productos: []
    };
  }

  getCategorias(): Observable<Categoria[]> {
    return this.http.get<{ $id: string, $values: any[] }>(this.apiUrl).pipe(
      map(response => response.$values.map(cat => this.mapCategoria(cat))),
      switchMap(categorias => {
        const categoriasMap = new Map<number, Categoria>();
        categorias.forEach((categoria: Categoria) => {
          if (categoria.idCategoria !== undefined) {
            categoriasMap.set(categoria.idCategoria, categoria);
          }
        });

        return this.http.get<{ $id: string, $values: any[] }>(this.apiUrlProductos).pipe(
          map(response => response.$values.map(product => this.mapProductToProductoConImagenes(product))),
          map((productos: ProductoConImagenes[]) => {
            productos.forEach((producto: ProductoConImagenes) => {
              const categoria = categoriasMap.get(producto.idCategoria);
              if (categoria) {
                if (!categoria.productos) {
                  categoria.productos = [];
                }
                categoria.productos.push(producto);
              } else {
                console.warn(`Producto con id ${producto.idProducto} no tiene categoría asociada.`);
              }
            });
            return Array.from(categoriasMap.values());
          })
        );
      })
    );
  }

  getCategoryById(idCategoria: number): Observable<Categoria> {
    return this.http.get<any>(`${this.apiUrl}/${idCategoria}`).pipe(
      map(categoria => this.mapCategoria(categoria))
    );
  }

  getUltimasCategorias(): Observable<Categoria[]> {
    return this.http.get<{ $values: any[] }>(`${this.apiUrl}/latest`).pipe(
      map(response => response.$values.map(cat => this.mapCategoria(cat)))
    );
  }

  agregarCategoria(categoria: Categoria): Observable<Categoria> {
    // Asumiendo que la API espera los nombres de propiedades en PascalCase
    const categoriaToSend = {
      NombreCategoria: categoria.nombreCategoria,
      ImagenCategoria: categoria.imagenCategoria
    };
    return this.http.post<any>(this.apiUrl, categoriaToSend).pipe(
      map(response => this.mapCategoria(response))
    );
  }
}