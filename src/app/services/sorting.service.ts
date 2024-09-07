import { Injectable } from '@angular/core';
import { ProductoConImagenes } from '../interfaces/interfaces-app';

@Injectable({
  providedIn: 'root'
})
export class SortingService {
  constructor() {}

  private getSortFunction(sortBy: string): (a: ProductoConImagenes, b: ProductoConImagenes) => number {
    const sortFunctions: { [key: string]: (a: ProductoConImagenes, b: ProductoConImagenes) => number } = {
      'nameAsc': (a, b) => (a.nombreProducto || '').localeCompare(b.nombreProducto || ''),
      'nameDesc': (a, b) => (b.nombreProducto || '').localeCompare(a.nombreProducto || ''),
      'popularityDesc': (a, b) => (b.CantVendido || 0) - (a.CantVendido || 0),
      'popularityAsc': (a, b) => (a.CantVendido || 0) - (b.CantVendido || 0),
      'newest': (a, b) => (b.idProducto || 0) - (a.idProducto || 0), // Asumiendo que ID más alto = más reciente
      'oldest': (a, b) => (a.idProducto || 0) - (b.idProducto || 0)
    };
    return sortFunctions[sortBy] || ((a, b) => 0);
  }


  sortProducts(products: ProductoConImagenes[], sortBy: string): ProductoConImagenes[] {
    console.log('Sorting products by:', sortBy);
    console.log('Original products:', products);
    
    const sortedProducts = [...products];
    const sortFunction = this.getSortFunction(sortBy);
    
    sortedProducts.sort(sortFunction);
    
    console.log('Sorted products:', sortedProducts);
    return sortedProducts;
  }

  getSortOptions() {
    return [
      { label: 'Nombre (A-Z)', value: 'nameAsc' },
      { label: 'Nombre (Z-A)', value: 'nameDesc' },
      { label: 'Más populares', value: 'popularityDesc' },
      { label: 'Menos populares', value: 'popularityAsc' },
      { label: 'Más recientes', value: 'newest' },
      { label: 'Más antiguos', value: 'oldest' }
    ];
  }
}
