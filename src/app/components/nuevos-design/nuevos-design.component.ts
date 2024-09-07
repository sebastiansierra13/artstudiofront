import { Component, HostListener, OnInit } from '@angular/core';
import { ImageModule } from 'primeng/image';
import { CommonModule } from '@angular/common';
import { ProductoConImagenes } from '../../interfaces/interfaces-app';
import { ServiceProductService } from '../../services/service-product.service';
import { Router, RouterLink } from '@angular/router';
import { WishlistService } from '../../services/wishlist.service';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-nuevos-design',
  standalone: true,
  imports: [ImageModule,CommonModule,RouterLink,ButtonModule,TagModule],
  templateUrl: './nuevos-design.component.html',
  styleUrl: './nuevos-design.component.css'
})
export class NuevosDesignComponent implements OnInit {

  ultimosProductos: ProductoConImagenes[] = [];
  overlayStates: { [key: number]: boolean } = {};
  dataLoaded = false;  // Nueva bandera
  screenWidth: number = 0;
  constructor(private wishlistService: WishlistService,private router: Router,private productService: ServiceProductService, private notificationService: NotificationService) {}
  
  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkScreenSize();
  }

  ngOnInit(): void {
    this.loadUltimosProductos();
    this.checkScreenSize();
  }
  
  checkScreenSize() {
    this.screenWidth = window.innerWidth;
    // Puedes usar esta variable para ajustar lógica adicional si es necesario
  }
  
  loadUltimosProductos() {
    this.productService.getUltimosProductos().subscribe(
      productos => {
        this.ultimosProductos = productos;
        this.ultimosProductos.forEach(p => {
          this.overlayStates[p.idProducto] = false;
        });
        this.dataLoaded = true;  // Marca los datos como cargados
      },
      error => {
        console.error('Error loading recent products', error);
        this.dataLoaded = true;  // Asegúrate de marcar como cargado incluso en caso de error
      }
    );
  }

  addToWishlist(event: Event, product: ProductoConImagenes) {
    this.wishlistService.addToWishlist(product);
    this.notificationService.showNotification('Producto agregado a la lista de deseos');
    event.stopPropagation();
  }

  onMouseEnter(product: ProductoConImagenes) {
    this.overlayStates[product.idProducto] = true;
  }

  onMouseLeave(product: ProductoConImagenes) {
    this.overlayStates[product.idProducto] = false;
  }

  isOverlayVisible(product: ProductoConImagenes | undefined): boolean {
    return product && product.idProducto ? this.overlayStates[product.idProducto] || false : false;
  }
}
