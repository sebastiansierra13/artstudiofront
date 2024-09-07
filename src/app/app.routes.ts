import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { HomeComponent } from './components/home/home.component';
import { ViewPreviaComponent } from './components/view-previa/view-previa.component';
import { NuevosDesignComponent } from './components/nuevos-design/nuevos-design.component';
import { ConfigurationAdminComponent } from './components/configuration-admin/configuration-admin.component';
import { AboutUsComponent } from './components/about-us/about-us.component';
import { AddProductComponent } from './components/add-product/add-product.component';
import { HomeCategoriasComponent } from './components/home-categorias/home-categorias.component';
import { HomeConectaCreatividadComponent } from './components/home-conecta-creatividad/home-conecta-creatividad.component';
import { HomeBannerComponent } from './components/home-banner/home-banner.component';
import { MyProductsComponent } from './components/my-products/my-products.component';
import { HighlightsComponent } from './components/highlights/highlights.component';
import { CheckoutComponent } from './components/checkout-component/checkout-component.component';
import { CarShopComponent } from './components/car-shop/car-shop.component';
import { DetailedCartComponent } from './components/detailed-cart/detailed-cart.component';
import { MenuAdminComponent } from './components/menu-admin/menu-admin.component';
import { FloatingButtonsComponent } from './components/floating-buttons/floating-buttons.component';
import { BlogCardComponent } from './components/blog-card/blog-card.component';
import { BlogDetailComponent } from './components/blog-detail/blog-detail.component';
import { ListProductsComponent } from './components/list-products/list-products.component';
import { WishlistComponent } from './components/wishlist/wishlist.component';
import { ListaCategoriasComponent } from './components/lista-categorias/lista-categorias.component';
import { NgModule } from '@angular/core';
import { AdminGuard } from './services/admin.guard'; // Importa el AdminGuard

export const routes: Routes = [
  { path: 'login', component: LoginComponent },  // Opción abierta para todos
  { path: 'home', component: HomeComponent },
  { path: 'preview/:nombre/:id', component: ViewPreviaComponent },
  { path: 'newDesign', component: NuevosDesignComponent },
  { path: 'admin', component: ConfigurationAdminComponent, canActivate: [AdminGuard] }, // Protegida por AdminGuard
  { path: 'about', component: AboutUsComponent },
  { path: 'add', component: AddProductComponent, canActivate: [AdminGuard] }, // Protegida por AdminGuard
  { path: 'products', component: MyProductsComponent, canActivate: [AdminGuard] }, // Protegida por AdminGuard},
  { path: 'highlights', component: HighlightsComponent, canActivate: [AdminGuard] }, // Protegida por AdminGuard
  { path: 'checkout', component: CheckoutComponent },
  { path: 'detailed-cart', component: DetailedCartComponent },
  { path: 'adminMenu', component: MenuAdminComponent, canActivate: [AdminGuard] }, // Protegida por AdminGuard
  { path: 'blog', component: BlogCardComponent },
  { path: 'blog/:id', component: BlogDetailComponent },
  { path: 'list', component: ListProductsComponent },
  { path: 'wishlist', component: WishlistComponent },
  { path: 'lista-categorias', component: ListaCategoriasComponent },
  { path: 'productos', component: ListProductsComponent },
  { path: 'list-products/:nombreCategoria/:idCategoria', component: ListProductsComponent },
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: '**', redirectTo: '/home', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { anchorScrolling: 'enabled' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
