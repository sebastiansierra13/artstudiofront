import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CartItem } from '../interfaces/interfaces-app';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItems = new BehaviorSubject<CartItem[]>([]);
  private readonly STORAGE_KEY = 'cart';
  private isLocalStorageAvailable: boolean;

  constructor() {
    this.isLocalStorageAvailable = this.checkLocalStorageAvailability();
    this.loadCartFromLocalStorage();
  }

  private loadCartFromLocalStorage() {
    if (this.isLocalStorageAvailable) {
      const storedCart = localStorage.getItem(this.STORAGE_KEY);
      if (storedCart) {
        try {
          this.cartItems.next(JSON.parse(storedCart));
        } catch (e) {
          console.error('Error parsing stored cart', e);
          this.cartItems.next([]);
        }
      }
    }
  }

  private checkLocalStorageAvailability(): boolean {
    const test = 'test';
    try {
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch(e) {
      return false;
    }
  }

  private saveCartToLocalStorage() {
    console.log('Guardando el carrito en localStorage:', this.cartItems.value);
    if (this.isLocalStorageAvailable) {
      try {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.cartItems.value));
      } catch (e) {
        console.error('Error saving cart to localStorage', e);
      }
    }
  }
  

  getCartItems() {
    return this.cartItems.asObservable();
  }

  addToCart(item: CartItem) {
    const currentItems = this.cartItems.value;

    // Validación mejorada del producto antes de agregarlo
    if (!item.size || item.posterPrice === undefined || item.posterPrice <= 0) {
        console.error('Producto mal formado antes de agregarlo al carrito:', item);
        return;
    }

    // Evitar que los precios se multipliquen por la cantidad en esta parte
    const existingItemIndex = currentItems.findIndex(i => 
        i.id === item.id && 
        JSON.stringify(i.options) === JSON.stringify(item.options)
    );

    if (existingItemIndex > -1) {
        // Solo incrementar la cantidad si el producto ya existe
        currentItems[existingItemIndex].quantity += item.quantity;
    } else {
        // Agregar el nuevo producto al carrito
        currentItems.push(item);
    }

    this.cartItems.next(currentItems);
    this.saveCartToLocalStorage();
  }

  removeFromCart(id: number) {
    const currentItems = this.cartItems.value;
    const updatedItems = currentItems.filter(item => item.id !== id);
    this.cartItems.next(updatedItems);
    this.saveCartToLocalStorage();
  }

  updateItemOptions(id: number, options: { [key: string]: string }) {
    const currentItems = this.cartItems.value;
    const item = currentItems.find(i => i.id === id);
    if (item) {
      item.options = options;
      this.cartItems.next(currentItems);
      this.saveCartToLocalStorage();
    }
  }

  // Aquí hacemos el cambio para asegurar el cálculo correcto del subtotal
  getSubtotal() {
    // Multiplicar el precio total por la cantidad en este momento
    return this.cartItems.value.reduce((acc, item) => acc + (item.quantity * (item.posterPrice + item.framePrice)), 0);
  }

  getItemCount() {
    return this.cartItems.value.reduce((acc, item) => acc + item.quantity, 0);
  }

  clearCart() {
    this.cartItems.next([]);
    this.saveCartToLocalStorage();
  }
}
