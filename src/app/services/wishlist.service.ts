import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ProductoConImagenes } from '../interfaces/interfaces-app';
@Injectable({
  providedIn: 'root'
})
export class WishlistService {
  private wishlistItems = new BehaviorSubject<ProductoConImagenes[]>([]);
  private readonly STORAGE_KEY = 'wishlist';
  private isLocalStorageAvailable: boolean;

  constructor() {
    this.isLocalStorageAvailable = this.checkLocalStorageAvailability();
    this.loadWishlistFromStorage();
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

  private loadWishlistFromStorage() {
    if (this.isLocalStorageAvailable) {
      const storedWishlist = localStorage.getItem(this.STORAGE_KEY);
      if (storedWishlist) {
        try {
          this.wishlistItems.next(JSON.parse(storedWishlist));
        } catch (e) {
          console.error('Error parsing stored wishlist', e);
          this.wishlistItems.next([]);
        }
      }
    }
  }

  private saveWishlistToStorage() {
    if (this.isLocalStorageAvailable) {
      try {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.wishlistItems.value));
      } catch (e) {
        console.error('Error saving wishlist to localStorage', e);
        // Aquí podrías implementar una lógica adicional, como notificar al usuario
      }
    }
  }

  getWishlistItems(): Observable<ProductoConImagenes[]> {
    return this.wishlistItems.asObservable();
  }

  addToWishlist(product: ProductoConImagenes) {
    const currentItems = this.wishlistItems.value;
    if (!currentItems.some(item => item.idProducto === product.idProducto)) {
      const newItems = [...currentItems, product];
      this.wishlistItems.next(newItems);
      this.saveWishlistToStorage();
    }
  }

  removeFromWishlist(productId: number) {
    const currentItems = this.wishlistItems.value;
    const newItems = currentItems.filter(item => item.idProducto !== productId);
    this.wishlistItems.next(newItems);
    this.saveWishlistToStorage();
  }

  clearWishlist() {
    this.wishlistItems.next([]);
    this.saveWishlistToStorage();
  }
}