import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { CartService } from '../../services/cart.service';
import { CartItem, Region, Departamento, Municipio } from '../../interfaces/interfaces-app';
import { Subject, takeUntil, forkJoin } from 'rxjs';
import { AccordionModule } from 'primeng/accordion';
import { DropdownModule } from 'primeng/dropdown';
import { SelectItem } from 'primeng/api';
import { LocationService } from '../../services/location.service';
import { ConfirmationService } from 'primeng/api';
import { MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { NavBarComponent } from "../nav-bar/nav-bar.component";
import { FloatingButtonsComponent } from "../floating-buttons/floating-buttons.component";
import { FooterComponent } from "../footer/footer.component";
import { OrderService } from '../../services/order.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-detailed-cart',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    InputTextModule,
    ButtonModule,
    DividerModule,
    AccordionModule,
    DropdownModule,
    ConfirmDialogModule,
    ToastModule,
    NavBarComponent,
    FloatingButtonsComponent,
    FooterComponent
],
  providers:[MessageService,ConfirmationService],
  templateUrl: './detailed-cart.component.html',
  styleUrls: ['./detailed-cart.component.css']
})
export class DetailedCartComponent implements OnInit, OnDestroy {
  cartItems: CartItem[] = [];
  couponCode = '';
  shippingOption = 'standard';
  departments: SelectItem[] = [];
  municipalities: SelectItem[] = [];
  selectedDepartment: number | null = null;
  selectedMunicipality: number | null = null;
  shippingCost: number = 0;
  totalCost: number = 0;
  regions: Region[] = [];
  departamentos: Departamento[] = [];
  municipios: Municipio[] = [];
  private unsubscribe$ = new Subject<void>();

  constructor(private cartService: CartService,
    private locationService: LocationService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private orderService: OrderService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.cartService.getCartItems()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(items => {
        this.cartItems = items;
        this.updateTotalCost();
      });

  }


  // detailed-cart.component.ts
  proceedToCheckout() {
    let hasInvalidProducts = false;
    this.cartItems.forEach(item => {
      if (!item.size || !item.posterPrice || !item.framePrice) {
        console.error('Producto mal formado en DetailedCartComponent, deteniendo el checkout:', item);
        hasInvalidProducts = true;
      }
    });
  
    if (hasInvalidProducts) {
      alert('Hay productos mal formados en el carrito. No puedes proceder al checkout.');
      return;
    }
  
    // Guardar los datos del carrito en el servicio
    this.orderService.setOrderItems(this.cartItems);
    this.orderService.setTotalCost(this.totalCost);
    this.orderService.setShippingInfo({
      departmentId: this.selectedDepartment,
      municipalityId: this.selectedMunicipality,
      shippingCost: this.shippingCost
    });
  
    this.router.navigate(['/checkout']);
  }
  

  updateTotalCost() {
    const subtotal = this.getSubtotal();
    this.totalCost = subtotal + this.shippingCost;
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  getSubtotal() {
    return this.cartService.getSubtotal();
  }

  removeItem(id: number) {
    this.cartService.removeFromCart(id);
    this.updateTotalCost();
  }


  clearCart() {
    this.cartService.clearCart();
    this.updateTotalCost();
  }

  confirmEmptyCart() {
    this.confirmationService.confirm({
      message: '¿Estás seguro de que quieres vaciar tu carrito?',
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.emptyCart();
      }
    });
  }

  emptyCart() {
    this.cartService.clearCart();
    this.cartItems = [];
    this.updateTotalCost();
    this.messageService.add({severity:'success', summary: 'Éxito', detail: 'El carrito ha sido vaciado'});
  }
}