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

  ngOnInit(): void {
    this.cartService.getCartItems()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (items) => {
          this.cartItems = items;
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
      // Guardar los datos del carrito en el servicio
      this.orderService.setOrderItems(this.cartItems);
      
      // Navegar al componente Checkout
      this.router.navigate(['/checkout']);
    } else {
      console.log("El carrito está vacío.");
    }
  }
}