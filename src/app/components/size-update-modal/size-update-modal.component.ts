import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { CommonModule } from '@angular/common';
import { Precio } from '../../interfaces/interfaces-app';
import { PrecioService } from '../../services/precio.service';

@Component({
  selector: 'app-size-update-modal',
  standalone: true,
  imports: [FormsModule, DropdownModule, InputNumberModule, ButtonModule, DialogModule, CommonModule],
  templateUrl: './size-update-modal.component.html',
  styleUrls: ['./size-update-modal.component.css']
})
export class SizeUpdateModalComponent {
  @Input() visible: boolean = false;
  @Input() precios: Precio[] = [];
  @Output() onCancel: EventEmitter<void> = new EventEmitter<void>();
  @Output() onSave: EventEmitter<Omit<Precio, 'IdPrecio'>[]> = new EventEmitter<Omit<Precio, 'IdPrecio'>[]>();

  newTamanhoPoster: string = '';
  newPrecioPoster: number = 0;
  newPrecioMarco: number = 0;

  constructor(private precioService: PrecioService) {}

  ngOnChanges() {
    console.log('Precios en SizeUpdateModal:', this.precios);
  }

  addSize() {
    if (this.newTamanhoPoster && !this.precios.some(precio => precio.TamanhoPoster === this.newTamanhoPoster)) {
      const newPrecio: Omit<Precio, 'IdPrecio'> = {
        TamanhoPoster: this.newTamanhoPoster,
        PrecioPoster: this.newPrecioPoster,
        PrecioMarco: this.newPrecioMarco
      };
     
      this.precioService.addPrecio(newPrecio).subscribe(
        (addedPrecio) => {
          this.precios.push(addedPrecio);
          this.resetNewSizeInputs();
        },
        (error) => {
          console.error('Error al agregar medida:', error);
        }
      );
    }
  }

  removeSize(index: number) {
    const idPrecio = this.precios[index].IdPrecio;
    this.precioService.removePrecio(idPrecio).subscribe(
      () => {
        this.precios.splice(index, 1);
      },
      (error) => {
        console.error('Error al eliminar medida:', error);
      }
    );
  }

  saveChanges() {
    const updatedPrecios: Omit<Precio, 'IdPrecio'>[] = this.precios.map(({ IdPrecio, ...rest }) => rest);
    this.onSave.emit(updatedPrecios);
    this.close();
  }

  close() {
    this.visible = false;
  }

  cancel() {
    this.onCancel.emit();
    this.close();
  }

  private resetNewSizeInputs() {
    this.newTamanhoPoster = '';
    this.newPrecioPoster = 0;
    this.newPrecioMarco = 0;
  }
}