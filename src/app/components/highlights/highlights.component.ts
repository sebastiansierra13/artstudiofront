import { Component, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService, PrimeNGConfig } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { OrderListModule } from 'primeng/orderlist';
import { CommonModule } from '@angular/common';
import { FileUploadModule } from 'primeng/fileupload';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CdkDragDrop, CdkDrag, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { MenuAdminComponent } from '../menu-admin/menu-admin.component';
import { ButtonAdminMenuComponent } from '../button-admin-menu/button-admin-menu.component';
import { BannersService } from '../../services/banners.service';
import { Banner, ProductoConImagenes } from '../../interfaces/interfaces-app';
import { Producto } from '../../interfaces/interfaces-app';
import { FormsModule } from '@angular/forms';  // Importar FormsModule
import {
  Storage,
  ref,
  uploadBytes,
  listAll,
  getDownloadURL,
} from '@angular/fire/storage';
import { getStorage, ref as storageRef } from 'firebase/storage';
import { ServiceProductService } from '../../services/service-product.service';




@Component({
  selector: 'app-highlights',
  standalone: true,
  imports: [ButtonModule,FormsModule, ToastModule, ConfirmDialogModule, OrderListModule, FileUploadModule, CommonModule, CdkDropList, CdkDrag, DragDropModule, MenuAdminComponent, ButtonAdminMenuComponent],
  providers: [ConfirmationService, MessageService, PrimeNGConfig],
  templateUrl: './highlights.component.html',
  styleUrl: './highlights.component.css'
})
export class HighlightsComponent implements OnInit{
  banners: Banner[] = [];
  listNewBanners: string[] = [];
  file: any[] = [];
  promises = [];
  tempHighlightedProducts: Producto[] = [];
  products: ProductoConImagenes[] = [];
  highlightedProducts: ProductoConImagenes[] = [];

  // Nuevas propiedades para el panel de título y subtítulo
  showBannerDetailsPanel: boolean = false;
  selectedBannerUrl: string = '';
  selectedBannerTitle: string = '';
  selectedBannerSubtitle: string = '';


  constructor(private productService: ServiceProductService,
    private storage: Storage, 
    private bannersService: BannersService,
    private confirmationService: ConfirmationService, 
    private messageService: MessageService,
    private config: PrimeNGConfig) {    
    
  }
 
  ngOnInit() {
    this.productService.getProducts().subscribe((products) => {
      this.products = products;
      this.highlightedProducts = this.products.filter((product: ProductoConImagenes) => product.destacado);
    });
    this.getHighlightedProducts();
    this.getBanners();
  }

  getHighlightedProducts() {
    this.productService.getProducts().subscribe(
      (products) => {
        this.highlightedProducts = products.filter(product => product.destacado);
        console.log('Productos destacados:', this.highlightedProducts);
      },
      (error) => {
        console.error('Error fetching products', error);
      }
    );
  }

  onReorder(event: any) {
    this.highlightedProducts.forEach((product, index) => {
      product.posicion = index + 1;
    });

    this.productService.updateHighlightedProducts(this.highlightedProducts).subscribe(
      () => {
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Orden de productos destacados actualizado', life: 3000 });
      },
      error => {
        console.error('Error updating highlighted products order', error);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo actualizar el orden', life: 3000 });
      }
    );
  }

  removeHighlightedProduct(product: Producto) {
    const updatedProduct = { ...product, destacado: false, posicion: undefined };
    this.productService.actualizarProducto(updatedProduct).subscribe(
      () => {
        this.getHighlightedProducts();
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Producto eliminado de destacados', life: 3000 });
      },
      error => {
        console.error('Error removing product from highlights', error);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar el producto de destacados', life: 3000 });
      }
    );
  }

  toggleFavorite(product: Producto) {
    product.destacado = !product.destacado;

    if (product.destacado) {
      if (this.highlightedProducts.length < 12) {
        const updatedProduct = {
          idProducto: product.idProducto,
          destacado: product.destacado,
          posicion: this.highlightedProducts.length + 1
        };
        this.addHighlightedProduct(updatedProduct);
      } else {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Máximo 12 productos en destacados', life: 3000 });
      }
    } else {
      const updatedProduct = { ...product, destacado: false, posicion: undefined };
      this.removeHighlightedProduct(updatedProduct);
    }
  }

  addHighlightedProduct(updatedProduct: any) {
    this.productService.actualizarProducto(updatedProduct).subscribe(
      () => {
        this.getHighlightedProducts();
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Producto añadido a destacados', life: 3000 });
      },
      error => {
        console.error('Error actualizando el producto', error);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo añadir el producto a destacados', life: 3000 });
      }
    );
  }

  onPositionChange(productId: number, newPosition: number) {
    const product = this.tempHighlightedProducts.find(p => p.idProducto === productId);
    if (product) {
      product.posicion = newPosition;
    }
  }

  saveChanges() {
    const updates = this.tempHighlightedProducts.map(product => ({
      idProducto: product.idProducto,
      posicion: product.posicion
    }));

    this.productService.updateProductPositions(updates).subscribe(
      () => {
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Posiciones actualizadas', life: 3000 });
        this.getHighlightedProducts();
      },
      error => {
        console.error('Error actualizando las posiciones', error);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron actualizar las posiciones', life: 3000 });
      }
    );
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.banners, event.previousIndex, event.currentIndex);
    this.updateBannerPositions();
  }

  updateBannerPositions() {
    // Filtrar los banners para asegurarse de que solo se incluyan aquellos con Id definido
    const updates = this.banners
      .filter(banner => banner.Id !== undefined) // Asegurarse de que Id esté definido
      .map((banner, index) => ({
        Id: banner.Id!, // Asegurarse de que Id no sea undefined
        Posicion: index + 1
      }));
  
    this.bannersService.updateBannerPositions(updates).subscribe(
      () => {
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Posiciones de banners actualizadas', life: 3000 });
      },
      error => {
        console.error('Error updating banner positions', error);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron actualizar las posiciones', life: 3000 });
      }
    );
  }
  
  onReorderBanners(event: any) {
    // Actualizar la posición de cada banner y asegurarse de que Id esté definido
    this.banners.forEach((banner, index) => {
      banner.Posicion = index + 1;
    });
  
    // Filtrar los banners para asegurarse de que solo se incluyan aquellos con Id definido
    const updates = this.banners
      .filter(banner => banner.Id !== undefined) // Asegurarse de que Id esté definido
      .map(banner => ({
        Id: banner.Id!, // Asegurarse de que Id no sea undefined
        Posicion: banner.Posicion
      }));
  
    this.bannersService.updateBannerPositions(updates).subscribe(
      () => {
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Orden de banners actualizado', life: 3000 });
      },
      error => {
        console.error('Error updating banner order', error);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo actualizar el orden', life: 3000 });
      }
    );
  }
  
  
  getBanners() {
    this.bannersService.getBanners().subscribe(
      (banners) => {
        this.banners = banners.map((banner, index) => ({
          ...banner,
          Posicion: banner.Posicion || index + 1,
          Url: banner.Url  // Asegúrate de que la propiedad URL esté presente y se asigne correctamente.
        }));
        this.banners.sort((a, b) => a.Posicion - b.Posicion);
      },
      (error) => {
        console.error('Error fetching banners', error);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los banners', life: 3000 });
      }
    );
  }
  
  private addBanners(newBannerUrls: string[]) {
    const newBanners: Banner[] = newBannerUrls.map((url, index) => ({
      Url: url,
      Posicion: this.banners.length + index + 1,
      Titulo: '', // Aquí puedes definir un valor por defecto si es necesario
      Subtitulo: '' // Aquí puedes definir un valor por defecto si es necesario
    }));
  
    this.bannersService.postBulkBanners(newBanners).subscribe(
      (response) => {
        console.log('Response from postBulkBanners:', response);
        if (response && Array.isArray(response)) {
          const addedBanners = response;
          this.banners = [...this.banners, ...addedBanners];
          this.updateBannerPositions();
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Banners agregados', life: 3000 });
        } else {
          console.error('La respuesta no es válida:', response);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'La respuesta no es válida', life: 3000 });
        }
      },
      error => {
        console.error('Error adding banners', error);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron agregar los banners', life: 3000 });
      }
    );
  }
  
  
  saveBannerDetails() {
    if (this.selectedBannerUrl) {
      const newBanner: Banner = {
        Url: this.selectedBannerUrl,
        Titulo: this.selectedBannerTitle || '',
        Subtitulo: this.selectedBannerSubtitle || '',
        Posicion: this.banners.length + 1
      };
  
      this.bannersService.postBulkBanners([newBanner]).subscribe(
        (response: any) => {
          console.log('Response from postBulkBanners:', response);
          if (response && response.$values && Array.isArray(response.$values)) {
            const addedBanner = response.$values[0];
            this.banners.push(addedBanner);
            this.updateBannerPositions();
            this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Banner agregado', life: 3000 });
            this.resetBannerForm();
          } else {
            console.error('La respuesta no contiene un array en $values:', response);
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'La respuesta no es válida', life: 3000 });
          }
        },
        (error: Error) => {
          console.error('Error adding banner:', error);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: error.message, life: 5000 });
        }
      );
    }
  }
  

  private resetBannerForm() {
    this.showBannerDetailsPanel = false;
    this.selectedBannerUrl = '';
    this.selectedBannerTitle = '';
    this.selectedBannerSubtitle = '';
  }

  private handleInvalidResponse(response: any) {
    console.error('Invalid response:', response);
    this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Respuesta inválida del servidor', life: 3000 });
  }

  cancelBannerDetails() {
    // Oculta el panel sin guardar
    this.showBannerDetailsPanel = false;
    this.selectedBannerUrl = '';
    this.selectedBannerTitle = '';
    this.selectedBannerSubtitle = '';
  }
  

  removeBanner(banner: Banner) {
    if (banner.Id === undefined) {
      console.error('Intento de eliminar un banner sin ID', banner);
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar el banner: ID no válido', life: 3000 });
      return;
    }
    
    this.bannersService.deleteBanner(banner.Id).subscribe(
      () => {
        // Primero, eliminar la imagen de Firebase
        this.bannersService.deleteImageFromFirebase(banner.Url)
          .then(() => {
            // Si la eliminación de Firebase es exitosa, actualizar el estado local
            this.banners = this.banners.filter(b => b.Id !== banner.Id);
            this.updateBannerPositions();
            this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Banner eliminado completamente', life: 3000 });
          })
          .catch(error => {
            console.error('Error removing image from Firebase', error);
            this.messageService.add({ severity: 'warning', summary: 'Advertencia', detail: 'Banner eliminado de la base de datos, pero no de Firebase', life: 3000 });
          });
      },
      error => {
        console.error('Error removing banner', error);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar el banner', life: 3000 });
      }
    );
  }

  async uploadBanners(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const files = Array.from(input.files);
      const uploadPromises: Promise<string>[] = [];

      for (const file of files) {
        uploadPromises.push(this.uploadImageToFirebase(file));
      }

      try {
        const urls = await Promise.all(uploadPromises);
        if (urls && urls.length > 0) {
          // Muestra el mini panel después de subir la imagen
          this.showBannerDetailsPanel = true;
          this.selectedBannerUrl = urls[0]; // Asume que solo se selecciona un banner a la vez
        } else {
          console.error('No URLs were returned from the upload process');
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron subir las imágenes', life: 3000 });
        }
      } catch (error) {
        console.error('Error uploading images', error);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron subir una o más imágenes', life: 3000 });
      }
    }
  }
  
  private async uploadImageToFirebase(file: File): Promise<string> {
    const storage = getStorage();
    const imagesRef = storageRef(storage, 'images/Banners');
    const imageRef = storageRef(imagesRef, file.name);
  
    try {
      const snapshot = await uploadBytes(imageRef, file);
      return await getDownloadURL(imageRef);
    } catch (error) {
      console.error('Error uploading to Firebase:', error);
      throw error;
    }
  }

  
  
}

  
  

