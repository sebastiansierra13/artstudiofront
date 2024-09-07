// order.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CartItem } from '../interfaces/interfaces-app';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private orderItemsSubject = new BehaviorSubject<CartItem[]>([]);
  orderItems$ = this.orderItemsSubject.asObservable();

  private totalCostSubject = new BehaviorSubject<number>(0);
  totalCost$ = this.totalCostSubject.asObservable();

  private shippingInfoSubject = new BehaviorSubject<{
    departmentId: number | null,
    municipalityId: number | null,
    shippingCost: number
  }>({ departmentId: null, municipalityId: null, shippingCost: 0 });
  shippingInfo$ = this.shippingInfoSubject.asObservable();

  setOrderItems(items: CartItem[]) {
    this.orderItemsSubject.next(items);
  }

  setTotalCost(total: number) {
    this.totalCostSubject.next(total);
  }

  setShippingInfo(info: { departmentId: number | null, municipalityId: number | null, shippingCost: number }) {
    this.shippingInfoSubject.next(info);
  }
}