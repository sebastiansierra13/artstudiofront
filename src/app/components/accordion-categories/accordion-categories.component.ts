import { Component, ChangeDetectionStrategy, ChangeDetectorRef, Input, Output, EventEmitter } from '@angular/core';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { Categoria, Producto, ProductoConImagenes } from '../../interfaces/interfaces-app';

@Component({
  selector: 'app-accordion-categories',
  standalone: true,
  imports: [CommonModule, FormsModule, ScrollingModule, ToolbarModule, ButtonModule, TableModule],
  templateUrl: './accordion-categories.component.html',
  styleUrls: ['./accordion-categories.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AccordionCategoriesComponent {
  @Input() categories: Categoria[] = [];
  @Output() openNewProduct = new EventEmitter<Categoria>();
  @Output() deleteSelectedProducts = new EventEmitter<Producto[]>();
  @Output() editProduct = new EventEmitter<Producto>();
  @Output() deleteProduct = new EventEmitter<{ category: Categoria, product: Producto }>();
  @Output() toggleFavorite = new EventEmitter<Producto>();
  @Output() categorySelected = new EventEmitter<Categoria>();
  selectedProducts: Producto[] = []; // Añadir esta propiedad
  expandedCategories: { [key: string]: boolean } = {};
  constructor(private cdr: ChangeDetectorRef) {}

  toggleAccordion(categoryName: string) {
    this.expandedCategories[categoryName] = !this.expandedCategories[categoryName];
    this.cdr.markForCheck();
  }

  openNew(category: Categoria) {
    this.openNewProduct.emit(category);
  }  

  deleteSelected() {    
      this.deleteSelectedProducts.emit(this.selectedProducts);    
  }


  edit(product: Producto) {
    this.editProduct.emit(product);
  }

  delete(category: Categoria, product: Producto) {
    this.deleteProduct.emit({ category, product });
  }

  toggleFavoriteProduct(product: Producto) {
    this.toggleFavorite.emit(product);
  }

  isFavorite(product: Producto): boolean {
    return !!product.destacado; // Utiliza el operador de doble negación para asegurar que el valor sea booleano
  }

  onCategoryClick(category: Categoria): void {
    this.categorySelected.emit(category);
  }
}
