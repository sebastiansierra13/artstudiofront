// notification.service.ts
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationSubject = new Subject<string>();

  notificationMessage$ = this.notificationSubject.asObservable();

  showNotification(message: string) {
    this.notificationSubject.next(message);
  }
}