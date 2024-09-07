import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { WishlistService } from '../../services/wishlist.service';
import { ProductoConImagenes } from '../../interfaces/interfaces-app';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-wishlist-panel',
  standalone: true,
  imports: [CommonModule, RouterModule,ScrollPanelModule,ButtonModule],
  templateUrl: './wishlist-panel.component.html',
  styleUrls: ['./wishlist-panel.component.css']
})
export class WishlistPanelComponent implements OnInit {
  wishlistItems: ProductoConImagenes[] = [];

  constructor(private wishlistService: WishlistService) {}

  ngOnInit() {
    this.wishlistService.getWishlistItems().subscribe(items => {
      this.wishlistItems = items;
    });
  }

  removeFromWishlist(productId: number) {
    this.wishlistService.removeFromWishlist(productId);
  }
}