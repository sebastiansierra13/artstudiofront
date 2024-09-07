import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Categoria } from '../../interfaces/interfaces-app';
import { CategoriaService } from '../../services/categoria.service';
import { Router, RouterModule } from '@angular/router';
import { NavBarComponent } from "../nav-bar/nav-bar.component";
import { FloatingButtonsComponent } from "../floating-buttons/floating-buttons.component";
import { FooterComponent } from "../footer/footer.component";

@Component({
  selector: 'app-lista-categorias',
  standalone: true,
  imports: [CommonModule, RouterModule, NavBarComponent, FloatingButtonsComponent, FooterComponent],
  templateUrl: './lista-categorias.component.html',
  styleUrls: ['./lista-categorias.component.css']
})
export class ListaCategoriasComponent implements OnInit {
  categorias: Categoria[] = [];
  loading: boolean = true;

  constructor(private categoriaService: CategoriaService, private router: Router) {}

  ngOnInit(): void {
    this.categoriaService.getCategorias().subscribe(
      data => {
        this.categorias = data;
        this.loading = false;
      },
      error => {
        console.error('Error fetching categories:', error);
        this.loading = false;
      }
    );
  }

  selectCategory(category: Categoria) {
    this.router.navigate(['/list-products', category.nombreCategoria, category.idCategoria]);
  }
}