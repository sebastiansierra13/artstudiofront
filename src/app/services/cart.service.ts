import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
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
          console.error('Error parsing stored wishlist', e);
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
    if (this.isLocalStorageAvailable) {
      try {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.cartItems.value));
      } catch (e) {
        console.error('Error saving wishlist to localStorage', e);
        // Aquí podrías implementar una lógica adicional, como notificar al usuario
      }
    }
  }

  getCartItems() {
    return this.cartItems.asObservable();
  }

  addToCart(item: CartItem) {
    const currentItems = this.cartItems.value;
    const existingItem = currentItems.find(i => i.id === item.id);
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      currentItems.push({...item, quantity: 1});
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

  getSubtotal() {    
    return this.cartItems.value.reduce((acc, item) => acc + (item.quantity * (item.price || 0)), 0);  
  }

  getItemCount() {
    return this.cartItems.value.reduce((acc, item) => acc + item.quantity, 0);
  }

  clearCart() {
    this.cartItems.next([]);
    this.saveCartToLocalStorage();
  }
}