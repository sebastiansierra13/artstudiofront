// wishlist.component.ts
import { Component, OnInit } from '@angular/core';
import { WishlistService } from '../../services/wishlist.service';
import { ProductoConImagenes } from '../../interfaces/interfaces-app';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { NavBarComponent } from "../nav-bar/nav-bar.component";
import { FloatingButtonsComponent } from "../floating-buttons/floating-buttons.component";
import { FooterComponent } from "../footer/footer.component";

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CommonModule, RouterLink, NavBarComponent, FloatingButtonsComponent, FooterComponent],
  templateUrl: './wishlist.component.html',
  styleUrls: ['./wishlist.component.css']
})
export class WishlistComponent implements OnInit {
  wishlistItems: ProductoConImagenes[] = [];

  constructor(
    private wishlistService: WishlistService,
    private router: Router
  ) {}

  ngOnInit() {
    this.wishlistService.getWishlistItems().subscribe(items => {
      this.wishlistItems = items;
    });
  }

  removeFromWishlist(productId: number) {
    this.wishlistService.removeFromWishlist(productId);
  }

  goToProductDetails(product: ProductoConImagenes) {
    this.router.navigate(['/preview', product.nombreProducto, product.idProducto]);
  }
}