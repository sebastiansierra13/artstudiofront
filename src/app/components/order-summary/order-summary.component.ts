import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PayUService } from '../../services/pay-u.service';
import { OrderDetails, Product } from '../../interfaces/interfaces-app';
import { CartService } from '../../services/cart.service';
import { FloatingButtonsComponent } from "../floating-buttons/floating-buttons.component";
import { FooterComponent } from "../footer/footer.component";
import { NavBarComponent } from "../nav-bar/nav-bar.component";  // Importar CartService

@Component({
  selector: 'app-order-summary',
  standalone: true,
  imports: [CommonModule, FloatingButtonsComponent, FooterComponent, NavBarComponent],
  templateUrl: './order-summary.component.html',
  styleUrls: ['./order-summary.component.css']
})
export class OrderSummaryComponent implements OnInit {
  orderSummary: OrderDetails | null = null;
  productos: Product[] = [];
  loading: boolean = true;
  errorMessage: string = '';
  estado: string = '';
  referencia: string = '';
  valor: number = 0;
  moneda: string = '';
  fecha: string = '';
  metodoPago: string = '';
  descripcion: string = '';
  authorizationCode: string = '';
  
  // Nuevas propiedades para manejar la UI
  statusClass: string = '';
  statusIcon: string = '';
  statusMessage: string = '';

  constructor(
    private route: ActivatedRoute, 
    private payUService: PayUService,
    private cartService: CartService  // Inyectar el servicio del carrito
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.setTransactionDetails(params);
      this.fetchOrderDetails();

      // Vaciar el carrito si la transacción es aprobada
      if (this.estado.toLowerCase() === 'aprobada') {
        this.cartService.clearCart();  // Vaciar el carrito
      }
    });
  }

  private setTransactionDetails(params: any): void {
    this.estado = params['estado'] || 'No definido';
    this.referencia = params['referencia'] || 'No definido';
    this.valor = Number(params['valor']) || 0;
    this.moneda = params['moneda'] || 'No definido';
    this.fecha = params['fecha'] || 'No definida';
    this.metodoPago = params['metodoPago'] || 'No definido';
    this.descripcion = params['descripcion'] || 'No definida';
    this.authorizationCode = params['authorizationCode'] || 'No definido';
    
    this.setStatusInfo();
  }

  private setStatusInfo(): void {
    switch (this.estado.toLowerCase()) {
      case 'aprobada':
        this.statusClass = 'success';
        this.statusIcon = 'check-circle';
        this.statusMessage = '¡Transacción exitosa!';
        break;
      case 'pendiente':
        this.statusClass = 'pending';
        this.statusIcon = 'clock';
        this.statusMessage = 'Transacción en proceso';
        break;
      default:
        this.statusClass = 'failed';
        this.statusIcon = 'x-circle';
        this.statusMessage = 'Transacción fallida';
    }
  }

  private fetchOrderDetails(): void {
    if (this.referencia && this.referencia !== 'No definido') {
      this.payUService.getOrderDetails(this.referencia).subscribe(
        (orderDetails: OrderDetails) => {
          this.orderSummary = orderDetails;
          this.productos = orderDetails.Products?.$values || [];
          this.loading = false;
        },
        (error) => {
          console.error('Error al obtener los detalles del pedido:', error);
          this.errorMessage = 'No se pudieron obtener los detalles del pedido.';
          this.loading = false;
        }
      );
    } else {
      this.errorMessage = 'Referencia de la transacción no válida.';
      this.loading = false;
    }
  }
}
