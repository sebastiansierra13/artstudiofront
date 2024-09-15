import { Component, Input } from '@angular/core';
import { Router ,RouterModule} from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-order-summary',
  standalone: true,
  imports: [RouterModule,CommonModule],
  templateUrl: './order-summary.component.html',
  styleUrl: './order-summary.component.css'
})
export class OrderSummaryComponent {

  @Input() paymentSuccess: boolean = false;
  @Input() buyerFullName: string = '';
  @Input() buyerEmail: string = '';
  @Input() shippingAddress: string = '';
  @Input() shippingCity: string  | undefined = '';
  @Input() shippingCountry: string = 'CO';
  @Input() total: number = 0;

  constructor(private router: Router) { }

  downloadInvoice() {
    // Implementar la lógica para descargar la factura en PDF
    alert('Descargando la factura...');
  }

  retryPayment() {
    // Redirigir al proceso de pago de nuevo
    this.router.navigate(['/checkout']);
  }

  goToHome() {
    // Redirigir a la página principal
    this.router.navigate(['/']);
  }
}
