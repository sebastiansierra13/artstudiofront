import { Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CarShopComponent } from '../car-shop/car-shop.component';
import { SidebarModule } from 'primeng/sidebar';
import { BadgeModule } from 'primeng/badge';
import { Router, RouterModule } from '@angular/router';
import { Categoria, isProducto, ProductoConImagenes } from '../../interfaces/interfaces-app';
import { CategoriaService } from '../../services/categoria.service';
import { CartService } from '../../services/cart.service';
import { CartItem } from '../../interfaces/interfaces-app';
import { WishlistService } from '../../services/wishlist.service';
import { WishlistPanelComponent } from "../wishlist-panel/wishlist-panel.component";
import { ButtonModule } from 'primeng/button';
import { debounceTime, distinctUntilChanged, of, Subject, Subscription, switchMap } from 'rxjs';
import { ServiceProductService } from '../../services/service-product.service';
import { FormsModule } from '@angular/forms';
import { BreakpointObserver, Breakpoints, BreakpointState } from '@angular/cdk/layout';

@Component({
  selector: 'app-nav-bar',
  standalone: true,
  imports: [FormsModule,ButtonModule, CarShopComponent, CommonModule, SidebarModule, BadgeModule, RouterModule, WishlistPanelComponent],
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.css'],
  providers: [BreakpointObserver]
})
export class NavBarComponent implements OnInit,  OnDestroy {
  showCart = false;
  showWishlist = false;
  visibleSidebar = false;
  showCategories = false;
  categories: Categoria[] = [];
  cartItemsCount = 0;
  wishlistItemsCount = 0;
  private hideTimeout: any;
  private categoriesTimeout: any;

  @ViewChild('mobileSearchInput') mobileSearchInput!: ElementRef;
  @ViewChild('searchInput') searchInput!: ElementRef;

  isMobile: boolean = false;
  searchQuery: string = '';
  mobileSearchQuery: string = '';
  searchResults: (ProductoConImagenes | Categoria)[] = [];
  mobileSearchResults: (ProductoConImagenes | Categoria)[] = [];
  showResults: boolean = false;
  showMobileResults: boolean = false;

  private searchSubject = new Subject<string>();
  private mobileSearchSubject = new Subject<string>();
  private breakpointSubscription: Subscription | undefined;
  
  constructor(
    private wishlistService: WishlistService,
    private cartService: CartService,
    private categoriaService: CategoriaService,
    private router: Router,
    private searchService: ServiceProductService,
    private elementRef: ElementRef,
    private breakpointObserver: BreakpointObserver

  ) {}

  ngOnInit(): void {
    this.loadCategories();
    this.updateCartItemsCount();
    this.updateWishlistItemsCount();
    this.initializeSearch(this.searchSubject, 'desktop');
    this.initializeSearch(this.mobileSearchSubject, 'mobile');
    this.breakpointSubscription = this.breakpointObserver
      .observe(['(max-width: 1024px)'])
      .subscribe((state: BreakpointState) => {
        this.isMobile = state.matches;
      });
  }

  ngOnDestroy() {
    if (this.breakpointSubscription) {
      this.breakpointSubscription.unsubscribe();
    }
  }

  initializeSearch(subject: Subject<string>, type: 'desktop' | 'mobile') {
    subject.pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap(query => {
            console.log(`Buscando: ${query}`);
            return query ? this.searchService.search(query) : of([]);
        })
    ).subscribe(results => {
        console.log(`Resultados para ${type}:`, results);
        if (type === 'desktop') {
            this.searchResults = results;
            this.showResults = results.length > 0 && this.searchQuery.length > 0;
        } else {
            this.mobileSearchResults = results;
            this.showMobileResults = results.length > 0 && this.mobileSearchQuery.length > 0;
        }
        console.log(`Mostrar resultados: ${this.showResults}`);
    });
}

onSearchInput() {
    console.log(`Input de búsqueda: ${this.searchQuery}`);
    this.searchSubject.next(this.searchQuery);
}

onMobileSearchInput() {
    console.log(`Input de búsqueda móvil: ${this.mobileSearchQuery}`);
    this.mobileSearchSubject.next(this.mobileSearchQuery);
}


  onSearchSubmit(event?: Event) {
    if (event) {
        event.preventDefault();
    }
    if (this.searchQuery) {
        this.searchService.search(this.searchQuery).subscribe(
            (results) => {
                this.router.navigate(['/list'], { 
                    queryParams: { q: this.searchQuery },
                    state: { searchResults: results }
                });
            },
            (error) => {
                console.error('Error in search:', error);
            }
        );
    }
}

onSearchMobileSubmit(event?: Event) {
  if (event) {
      event.preventDefault();
  }
  if (this.mobileSearchQuery) {
      this.searchService.search(this.mobileSearchQuery).subscribe(
          (results) => {
              this.router.navigate(['/list'], { 
                  queryParams: { q: this.mobileSearchQuery },
                  state: { searchMobileResults: results }
              });
          },
          (error) => {
              console.error('Error in search:', error);
          }
      );
  }
}


  selectSearchResult(item: ProductoConImagenes | Categoria) {
    if (this.isProducto(item)) {
      this.router.navigate(['/preview', item.nombreProducto, item.idProducto]);
    } else {
      this.router.navigate(['/list', item.nombreCategoria, item.idCategoria]);
    }
    this.clearSearch();
  }

  selectMobileSearchResult() {
    this.navigateToResult(this.mobileSearchQuery);
    this.clearMobileSearch();
    this.visibleSidebar = false;
  }

  private navigateToResult(query: string) {
    this.router.navigate(['/list'], { queryParams: { q: query } });
  }
  
  
  clearSearch() {
    this.searchQuery = '';
    this.searchResults = [];
    this.showResults = false;
    this.searchInput.nativeElement.focus();
  }

  clearMobileSearch() {
    this.mobileSearchQuery = '';
    this.mobileSearchResults = [];
    this.showMobileResults = false;
    this.mobileSearchInput.nativeElement.focus();
  }


  
   
  

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.showResults = false;
      this.showMobileResults = false;
    }
  }

  @HostListener('document:keydown.enter', ['$event'])
  onEnter(event: KeyboardEvent) {
    if (this.searchQuery) {
      this.onSearchSubmit(); // Trigger search on Enter key press
    }
  }


  isProducto(item: ProductoConImagenes | Categoria): item is ProductoConImagenes {
    return (item as ProductoConImagenes).nombreProducto !== undefined;
  }

  loadCategories() {
    this.categoriaService.getCategorias().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (error) => {
        console.error('Error al cargar categorías', error);
      }
    });
  }

  updateCartItemsCount() {
    this.cartService.getCartItems().subscribe(items => {
      this.cartItemsCount = items.length;
    });
  }

  updateWishlistItemsCount() {
    this.wishlistService.getWishlistItems().subscribe(items => {
      this.wishlistItemsCount = items.length;
    });
  }

  showPanel(panel: 'cart' | 'wishlist') {
    this.clearHideTimeout();
    this.hideAllPanels();
    if (panel === 'cart') {
      this.showCart = true;
    } else if (panel === 'wishlist') {
      this.showWishlist = true;
    }
  }

  hidePanel(panel: 'cart' | 'wishlist') {
    this.hideTimeout = setTimeout(() => {
      if (panel === 'cart') {
        this.showCart = false;
      } else if (panel === 'wishlist') {
        this.showWishlist = false;
      }
    }, 200);
  }

  keepPanelOpen(panel: 'cart' | 'wishlist') {
    this.clearHideTimeout();
    if (panel === 'cart') {
      this.showCart = true;
    } else if (panel === 'wishlist') {
      this.showWishlist = true;
    }
  }

  private clearHideTimeout() {
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
      this.hideTimeout = null;
    }
  }

  private hideAllPanels() {
    this.showCart = false;
    this.showWishlist = false;
    this.showCategories = false;
  }

  toggleSidebar() {
    this.visibleSidebar = !this.visibleSidebar;
  }

  selectCategory(category: Categoria) {
    this.router.navigate(['/list-products', category.nombreCategoria, category.idCategoria]);
  }

  showCategoriesPanel() {
    this.clearCategoriesTimeout();
    this.showCategories = true;
  }

  hideCategoriesPanel() {
    this.categoriesTimeout = setTimeout(() => {
      this.showCategories = false;
    }, 200);
  }

  keepCategoriesPanelOpen() {
    this.clearCategoriesTimeout();
    this.showCategories = true;
  }

  private clearCategoriesTimeout() {
    if (this.categoriesTimeout) {
      clearTimeout(this.categoriesTimeout);
      this.categoriesTimeout = null;
    }
  }
}