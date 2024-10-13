import { Component, OnInit, HostListener, Input, ElementRef, Renderer2 } from '@angular/core';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { CarouselModule } from 'primeng/carousel';
import { TagModule } from 'primeng/tag';
import { Router, RouterLink } from '@angular/router';
import { ProductoConImagenes } from '../../interfaces/interfaces-app';
import { ServiceProductService } from '../../services/service-product.service';
import { WishlistService } from '../../services/wishlist.service';
import { MessageService } from 'primeng/api';
import { NotificationService } from '../../services/notification.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home-destacados',
  standalone: true,
  imports: [CardModule, ButtonModule, CarouselModule, TagModule, RouterLink, CommonModule],
  templateUrl: './home-destacados.component.html',
  providers: [MessageService],
  styleUrls: ['./home-destacados.component.css']
})
export class HomeDestacadosComponent implements OnInit {
  imgSelect: String = '';
  @Input() products: ProductoConImagenes[] = [];
  @Input() showOnlyDestacados: boolean = true;

  isSmallScreen: boolean = false;
  isMobileOrTablet: boolean = false;

  // Variables para el control del touch
  initialTouchX: number = 0;
  initialTouchY: number = 0;
  lastTouchX: number = 0;
  lastTouchY: number = 0;
  isSwiping: boolean = false;

  responsiveOptions = [
    {
      breakpoint: '1024px',
      numVisible: 2,
      numScroll: 1
    },
    {
      breakpoint: '800px',
      numVisible: 2,
      numScroll: 1
    },
    {
      breakpoint: '560px',
      numVisible: 1,
      numScroll: 1
    }
  ];

  constructor(
    private wishlistService: WishlistService,
    private router: Router,
    private serviceProduct: ServiceProductService,
    private notificationService: NotificationService,
    private elRef: ElementRef,
    private renderer: Renderer2
  ) {}

  ngOnInit() {
    if (this.showOnlyDestacados) {
      this.serviceProduct.getProducts().subscribe(
        data => {
          this.products = data
            .filter(product => product.destacado)
            .sort((a, b) => a.posicion! - b.posicion!);
        },
        error => {
          console.error("error es:", error);
        }
      );
    } else {
      this.products = this.products.sort((a, b) => a.posicion! - b.posicion!);
    }

    this.checkScreenSize();
    this.setupTouchListeners();  // Activamos la detección de los eventos táctiles
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkScreenSize();
  }

  private checkScreenSize(): void {
    this.isSmallScreen = window.innerWidth <= 450;
    this.isMobileOrTablet = window.innerWidth <= 1024;
  }

  addToWishlist(event: Event, product: ProductoConImagenes) {
    this.wishlistService.addToWishlist(product);
    this.notificationService.showNotification('Producto agregado a la lista de deseos');
    event.stopPropagation();
  }

  // Agregamos listeners para detectar los gestos táctiles en el carrusel
  setupTouchListeners() {
    const carouselElement = this.elRef.nativeElement.querySelector('.carousel-container');
    
    if (carouselElement) {
      this.renderer.listen(carouselElement, 'touchstart', (event: TouchEvent) => this.onTouchStart(event));
      this.renderer.listen(carouselElement, 'touchmove', (event: TouchEvent) => this.onTouchMove(event));
      this.renderer.listen(carouselElement, 'touchend', (event: TouchEvent) => this.onTouchEnd(event));
    }
  }

  // Detectamos el inicio del toque
  onTouchStart(event: TouchEvent) {
    this.isSwiping = false;
    this.initialTouchX = event.touches[0].clientX;
    this.initialTouchY = event.touches[0].clientY;
  }

  // Detectamos el movimiento
  onTouchMove(event: TouchEvent) {
    this.lastTouchX = event.touches[0].clientX;
    this.lastTouchY = event.touches[0].clientY;

    const deltaX = this.lastTouchX - this.initialTouchX;
    const deltaY = this.lastTouchY - this.initialTouchY;

    // Si el desplazamiento vertical es mayor que el horizontal, permitimos el desplazamiento vertical
    if (Math.abs(deltaY) > Math.abs(deltaX)) {
      // Permitir el desplazamiento vertical
      this.isSwiping = false;
    } else {
      // Detenemos el evento para que el carrusel maneje el desplazamiento horizontal
      this.isSwiping = true;
      event.preventDefault();
    }
  }

  // Terminamos el gesto táctil
  onTouchEnd(event: TouchEvent) {
    if (this.isSwiping) {
      // El usuario estaba haciendo un swipe horizontal (cambio de card)
      console.log('Swipe horizontal detectado');
    } else {
      // El usuario estaba haciendo scroll vertical
      console.log('Scroll vertical detectado');
    }
  }

}
