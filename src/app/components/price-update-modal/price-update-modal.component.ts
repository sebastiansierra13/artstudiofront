import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { CommonModule } from '@angular/common';
import { Precio } from '../../interfaces/interfaces-app';

@Component({
  selector: 'app-price-update-modal',
  standalone: true,
  imports: [FormsModule, DropdownModule, InputNumberModule, ButtonModule, DialogModule,CommonModule],
  templateUrl: './price-update-modal.component.html',
  styleUrls: ['./price-update-modal.component.css']
})
export class PriceUpdateModalComponent implements OnChanges {
  @Input() visible: boolean = false;
  @Input() precios: Precio[] = [];
  @Output() updatePrices = new EventEmitter<Precio>();
  @Output() onCancel: EventEmitter<void> = new EventEmitter<void>();

  selectedPrecio: Precio | null = null;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['precios'] && this.precios.length > 0) {
      console.log('Precios actualizados:', this.precios);
    }
  }

  onPrecioSelect(event: any) {
    this.selectedPrecio = event.value;
    console.log('Precio seleccionado:', this.selectedPrecio);
  }

  saveChanges() {
    if (this.selectedPrecio) {
      console.log('Enviando precio actualizado:', this.selectedPrecio);
      this.updatePrices.emit(this.selectedPrecio);
      this.close();  // Cerrar el modal después de emitir el evento
    } else {
      console.error('No hay precio seleccionado para actualizar');
    }
  }

  close() {
    this.visible = false;
  }

  cancel() {
    this.onCancel.emit();
    this.close();
  }
}