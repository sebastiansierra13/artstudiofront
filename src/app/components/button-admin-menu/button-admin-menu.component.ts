import { Component, Input } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-button-admin-menu',
  standalone: true,
  imports: [ButtonModule,RouterModule],
  templateUrl: './button-admin-menu.component.html',
  styleUrl: './button-admin-menu.component.css'
})
export class ButtonAdminMenuComponent {
  @Input() disableMisProductos: boolean = false;
  @Input() disableDestacados: boolean = false;
  @Input() disableConfiguracion: boolean = false;
}
