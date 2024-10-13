import { Component, OnInit, HostListener, Input, ViewChild, ElementRef } from '@angular/core';
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
  isSmallScreen: boolean = false;
  isMobileOrTablet: boolean = false;

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

  // Evento que captura el cambio de página en el carrusel
  handlePageChange(event: any) {
    console.log('Página cambiada:', event.page);
  }

  addToWishlist(event: Event, product: ProductoConImagenes) {
    this.wishlistService.addToWishlist(product);
    this.notificationService.showNotification('Producto agregado a la lista de deseos');
    event.stopPropagation();
  }
}
