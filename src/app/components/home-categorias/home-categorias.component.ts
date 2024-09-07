import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Categoria } from '../../interfaces/interfaces-app';
import { CategoriaService } from '../../services/categoria.service';
import { Router,RouterModule } from '@angular/router';

@Component({
  selector: 'app-home-categorias',
  standalone: true,
  imports: [CommonModule,RouterModule],
  templateUrl: './home-categorias.component.html',
  styleUrls: ['./home-categorias.component.css']
})
export class HomeCategoriasComponent implements OnInit {
  categorias: Categoria[] = [];

  constructor(private categoriaService: CategoriaService, private router: Router) {}

  ngOnInit(): void {
    this.categoriaService.getUltimasCategorias().subscribe(
      data => {
        this.categorias = data;
      },
      error => console.error('Error fetching categories:', error)
    );
  }

  selectCategory(category: Categoria) {
    this.router.navigate(['/list-products',category.nombreCategoria, category.idCategoria]);
  }
}
