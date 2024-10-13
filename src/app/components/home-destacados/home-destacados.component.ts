import { Component, OnInit, HostListener, Input } from '@angular/core';
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
  imports: [CardModule, ButtonModule, CarouselModule, TagModule, RouterLink,CommonModule],
  templateUrl: './home-destacados.component.html',
  providers: [MessageService],
  styleUrls: ['./home-destacados.component.css']
})
export class HomeDestacadosComponent implements OnInit {
  imgSelect: String = '';
  @Input() products: ProductoConImagenes[] = [];
  @Input() showOnlyDestacados: boolean = true;
  initialTouchX: number = 0;
  initialTouchY: number = 0;
  isSmallScreen: boolean = false;

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
  isMobileOrTablet: boolean = false;

  constructor(
    private wishlistService: WishlistService,
    private router: Router,
    private serviceProduct: ServiceProductService,
    private notificationService: NotificationService
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

  // Detectar el inicio del touch
  @HostListener('touchstart', ['$event'])
  onTouchStart(event: TouchEvent) {
    this.initialTouchX = event.touches[0].clientX;
    this.initialTouchY = event.touches[0].clientY;
  }

  // Detectar el movimiento del touch
  @HostListener('touchmove', ['$event'])
  onTouchMove(event: TouchEvent) {
    const deltaX = event.touches[0].clientX - this.initialTouchX;
    const deltaY = event.touches[0].clientY - this.initialTouchY;

    // Si el desplazamiento en Y es mayor que en X, permitimos el scroll vertical
    if (Math.abs(deltaY) > Math.abs(deltaX)) {
      event.stopPropagation(); // Permitir el desplazamiento vertical
    }
  }
}
