import { Component, OnDestroy, OnInit } from '@angular/core';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { CartItem } from '../../interfaces/interfaces-app';
import { Subject, takeUntil } from 'rxjs';
import { OrderService } from '../../services/order.service';

@Component({
  selector: 'app-cart-small',
  standalone: true,
  imports: [CommonModule, ScrollPanelModule, RouterModule, ButtonModule],
  templateUrl: './car-shop.component.html',
  styleUrls: ['./car-shop.component.css']
})
export class CarShopComponent implements OnInit,  OnDestroy {
  cartItems: CartItem[] = [];
  countCart = 0;
  private unsubscribe$ = new Subject<void>();
  
  constructor(private cartService: CartService, private router: Router, private orderService: OrderService) { }

 // car-shop.component.ts
 ngOnInit(): void {
  this.cartService.getCartItems()
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe({
      next: (items) => {
        this.cartItems = items;

        // Verificar si los productos están bien formados
        this.cartItems.forEach(item => {
          // Asegúrate de que posterPrice y size sean válidos
          if (item.posterPrice === undefined || item.size === undefined) {
            console.error('Producto mal formado en CarShopComponent:', item);
          }
        });

        this.countCart = this.cartService.getItemCount();
      },
      error: (err) => console.error('Error fetching cart items:', err)
    });
}

  

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  getSubtotal() {
    return this.cartService.getSubtotal();
  }

  removeItem(id: number) {
    this.cartService.removeFromCart(id);
  }

  // Nuevo método checkout para navegar al CheckoutComponent
  checkout() {
    if (this.cartItems.length > 0) {
        // Verificar si los productos están bien formados antes de proceder al checkout
        let hasInvalidProducts = false;
        this.cartItems.forEach(item => {
            // Solo verificar si size y posterPrice están definidos
            if (item.size === undefined || item.posterPrice === undefined) {
                console.error('Producto mal formado en CarShopComponent, deteniendo el checkout:', item);
                hasInvalidProducts = true;
            }
        });

        if (hasInvalidProducts) {
            alert('Hay productos mal formados en el carrito. No puedes proceder al checkout.');
            return;
        }

        // Guardar los datos del carrito en el servicio
        this.orderService.setOrderItems(this.cartItems);
        
        // Navegar al componente Checkout
        this.router.navigate(['/checkout']);
    } else {
        console.log("El carrito está vacío.");
    }
}

  
}