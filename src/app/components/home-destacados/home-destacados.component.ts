import { Component, OnInit, HostListener, Input, ViewChild, ElementRef, Renderer2 } from '@angular/core';
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
  @ViewChild('carouselContainer') carouselContainer!: ElementRef;
  private hammer: HammerManager | null = null;
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
    private notificationService: NotificationService,
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
  
  }

  ngAfterViewInit() {
    this.initHammer();
  }

  // Integrar HammerJS
  initHammer() {
    if (this.carouselContainer) {
      this.hammer = new Hammer(this.carouselContainer.nativeElement);
      this.hammer.get('swipe').set({ direction: Hammer.DIRECTION_HORIZONTAL }); // Detectar solo horizontal
      this.hammer.on('swipeleft', () => {
        this.nextSlide(); // Implementa la lógica de ir al siguiente slide
      });
      this.hammer.on('swiperight', () => {
        this.prevSlide(); // Implementa la lógica de ir al slide anterior
      });
    }
  }

  nextSlide() {
    console.log("Siguiente slide");
  }

  prevSlide() {
    console.log("Slide anterior");
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
}
