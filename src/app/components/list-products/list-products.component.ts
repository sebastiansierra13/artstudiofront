import { ChangeDetectorRef, Component, HostListener, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { NavBarComponent } from "../nav-bar/nav-bar.component";
import { FloatingButtonsComponent } from "../floating-buttons/floating-buttons.component";
import { FooterComponent } from "../footer/footer.component";
import { Categoria, ProductoConImagenes } from '../../interfaces/interfaces-app';
import { CategoriaService } from '../../services/categoria.service';
import { ServiceProductService } from '../../services/service-product.service'; // Importar el servicio de productos
import { ActivatedRoute } from '@angular/router';
import { Router, RouterLink } from '@angular/router';
import { WishlistService } from '../../services/wishlist.service';
import { NotificationService } from '../../services/notification.service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { Subscription } from 'rxjs';
import { SortingService } from '../../services/sorting.service';
@Component({
  selector: 'app-list-products',
  standalone: true,
  templateUrl: './list-products.component.html',
  styleUrls: ['./list-products.component.css'],
  imports: [ToastModule, CommonModule, HttpClientModule, ButtonModule, DropdownModule, NavBarComponent, FloatingButtonsComponent, FooterComponent,RouterLink],
  providers: [MessageService]
})
export class ListProductsComponent implements OnInit, OnDestroy {
  productos: ProductoConImagenes[] = []; // Inicializa como array vacío
  categoria: Categoria | null = null; // Añadir propiedad para la categoría
  columnas: number = 4; // Por defecto mostrar en 4 columnas
  itemsPerPage: number = 16;
  displayedProductos: ProductoConImagenes[] = [];
  currentPage: number = 1;
  pageSize: number = 12; // Número de productos que se cargan en cada "página"
  isAnimating: boolean = false;
  private notificationSubscription: Subscription | undefined;
  sortOptions: any[] | undefined;
  showAllProducts: boolean = false;
  defaultBannerImage: string = 'assets/imgAboutUs/banner_pagina.jpg'; // Agrega la ruta de tu imagen predeterminada
  

  searchQuery: string = '';
  isSearchResult: boolean = false;

  
  constructor(
    private wishlistService: WishlistService,
    private notificationService: NotificationService,
    private messageService: MessageService,
    private route: ActivatedRoute, // Inyectar ActivatedRoute
    private router: Router,
    private productService: ServiceProductService ,// Inyectar el servicio de productos
    private categoriaService: CategoriaService, // Inyectar el servicio de categorías
    private sortingService: SortingService,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.sortOptions = this.sortingService.getSortOptions();
    this.productos = []; // Asegúrate de inicializar productos
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.searchQuery = params['q'];
      if (this.searchQuery) {
          this.isSearchResult = true;
          this.loadSearchResults(this.searchQuery);
      } else {
          this.route.params.subscribe(params => {
              const idCategoria = params['idCategoria'];
              if (idCategoria) {
                  this.showAllProducts = false;
                  this.loadProducts(idCategoria);
                  this.loadCategory(idCategoria);
              } else {
                  this.showAllProducts = true;
                  this.loadAllProducts();
              }
        });
      }
    });
  
    this.checkScreenSize();
    console.log('Initial productos:', this.productos);
  
    this.notificationSubscription = this.notificationService.notificationMessage$.subscribe(
      message => {
        this.messageService.add({
          severity: 'success',
          summary: 'Notificación',
          detail: message,
          life: 3000,
          styleClass: 'custom-toast'
        });
      }
    );
  
    if (isPlatformBrowser(this.platformId)) {
      this.checkScreenSize();
    }
  }
  

  ngOnDestroy() {
    if (this.notificationSubscription) {
        this.notificationSubscription.unsubscribe();
    }
}


loadSearchResults(query: string): void {
  this.productService.search(query).subscribe(
    (productos: ProductoConImagenes[]) => {
      this.productos = productos;
      console.log('Productos después de cargar resultados de búsqueda:', this.productos);
      this.updateDisplayedProducts();
    },
    error => {
      console.error('Error cargando resultados de búsqueda:', error);
    }
  );
}


  addToWishlist(event: Event, product: ProductoConImagenes) {
    this.wishlistService.addToWishlist(product);
    this.notificationService.showNotification('Producto agregado a la lista de deseos');
    event.stopPropagation();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    if (isPlatformBrowser(this.platformId)) {
      this.checkScreenSize();
    }
  }

  private checkScreenSize() {
    if (typeof window !== 'undefined') {
      if (window.innerWidth <= 768) {
        this.columnas = 2;
      }
    }
  }
  
  loadProducts(idCategoria: number): void {
    this.productService.getProductsByCategory(idCategoria).subscribe(
      (productos: ProductoConImagenes[]) => {
        this.productos = productos;
        this.updateDisplayedProducts();
      },
      error => {
        console.error('Error al cargar los productos:', error);
        this.productos = [];
      }
    );
  }

  loadAllProducts(): void {
    this.productService.getAllProducts().subscribe(
      (productos: ProductoConImagenes[]) => {
        this.productos = productos;
        this.updateDisplayedProducts();
      },
      error => {
        console.error('Error al cargar todos los productos:', error);
        this.productos = [];
      }
    );
  }

  onSortChange(event: any): void {
    console.log('Sorting option selected:', event.value);
    this.productos = this.sortingService.sortProducts([...this.productos], event.value);
    console.log('Sorted products:', this.productos);
    this.updateDisplayedProducts();
    this.cdr.detectChanges();
  }

  private updateDisplayedProducts(): void {
    console.log('Updating displayed products');
    this.displayedProductos = this.productos.slice(0, this.itemsPerPage * this.currentPage);
    console.log('Displayed products:', this.displayedProductos);
  }


  loadMore() {
    const nextPage = this.currentPage + 1;
    const nextProducts = this.productos.slice(this.currentPage * this.pageSize, nextPage * this.pageSize);
    this.displayedProductos = [...this.displayedProductos, ...nextProducts];
    this.currentPage = nextPage;
  }

  handleProductClick(producto: ProductoConImagenes): void {
    console.log('Producto:', producto);
  }

  loadCategory(idCategoria: number): void {
    this.categoriaService.getCategoryById(idCategoria).subscribe(response => {
      this.categoria = response;
      console.log('Categoría cargada:', this.categoria); // Verifica la estructura de los datos
    });
  }

  onColumnChange(newColumns: number): void {
    if (this.isAnimating || this.columnas === newColumns) return;
  
    this.isAnimating = true;
    
    // Añadir clase de animación a todas las tarjetas
    const cards = document.querySelectorAll('.product-card');
    cards.forEach(card => card.classList.add('animate'));
  
    // Esperar a que termine la animación de desvanecimiento
    setTimeout(() => {
      this.columnas = newColumns;
  
      // Forzar un reflow para que las tarjetas se reposicionen
      // antes de que comience la animación de aparición
      cards.forEach(card => (card as HTMLElement).offsetHeight);
  
      // Quitar la clase de animación para que las tarjetas aparezcan
      cards.forEach(card => card.classList.remove('animate'));
  
      // Esperar a que termine la animación de aparición
      setTimeout(() => {
        this.isAnimating = false;
      }, 500);
    }, 500);
  }

  onPageChange(page: number): void {
    this.currentPage = page;
  }


  get paginatedProductos(): ProductoConImagenes[] {
    if (!Array.isArray(this.productos)) {
      return [];
    }
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.productos.slice(start, start + this.itemsPerPage);
  }

  get totalPages(): number {
    if (!Array.isArray(this.productos)) {
      return 0;
    }
    return Math.ceil(this.productos.length / this.itemsPerPage);
  }
}
