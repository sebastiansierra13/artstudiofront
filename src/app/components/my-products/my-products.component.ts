import { ChangeDetectorRef, Component, HostListener, Inject, OnInit, Renderer2, ViewChild } from '@angular/core';
import { AccordionModule } from 'primeng/accordion';
import { AvatarModule } from 'primeng/avatar';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { RippleModule } from 'primeng/ripple';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { CommonModule, DOCUMENT } from '@angular/common';
import { FileUploadModule } from 'primeng/fileupload';
import { DropdownModule } from 'primeng/dropdown';
import { TagModule } from 'primeng/tag';
import { RadioButtonModule } from 'primeng/radiobutton';
import { RatingModule } from 'primeng/rating';
import { FormsModule } from '@angular/forms';
import { InputNumberModule } from 'primeng/inputnumber';
import { AddProductComponent } from '../add-product/add-product.component';
import { MenuAdminComponent } from '../menu-admin/menu-admin.component';
import { ButtonAdminMenuComponent } from '../button-admin-menu/button-admin-menu.component';
import { ServiceProductService } from '../../services/service-product.service';
import { CategoriaService } from '../../services/categoria.service';
import { ScrollingModule } from '@angular/cdk/scrolling';
import {
  Storage,
  ref,
  uploadBytes,
  getDownloadURL,
  getStorage,
} from '@angular/fire/storage';
import { Categoria, Producto, ProductoConImagenes } from '../../interfaces/interfaces-app';
import { AccordionCategoriesComponent } from "../accordion-categories/accordion-categories.component";

@Component({
    selector: 'app-my-products',
    standalone: true,
    providers: [ConfirmationService, MessageService],
    templateUrl: './my-products.component.html',
    styleUrls: ['./my-products.component.css'],
    imports: [
        AccordionModule,
        AvatarModule,
        TableModule,
        DialogModule,
        RippleModule,
        ButtonModule,
        ToastModule,
        ToolbarModule,
        ConfirmDialogModule,
        InputTextModule,
        InputTextareaModule,
        CommonModule,
        FileUploadModule,
        DropdownModule,
        TagModule,
        RadioButtonModule,
        RatingModule,
        FormsModule,
        InputNumberModule,
        AddProductComponent,
        MenuAdminComponent,
        ButtonAdminMenuComponent,
        ScrollingModule,
        AccordionCategoriesComponent
    ]
})
export class MyProductsComponent implements OnInit {
  expandedCategories: { [key: string]: boolean } = {};


  @ViewChild('fileUpload') fileUpload: any;
  totalSize: number = 0;
  totalSizePercent: number = 0;

  productDialog: boolean = false;
  products: ProductoConImagenes[] = [];
  selectedProducts: Producto[] | null = null;
  submitted: boolean = false;
  product: Producto = this.createEmptyProduct();
  displayAddProductPanel: boolean = false;
  displayAddCategoryDialog: boolean = false; // Controla la visibilidad del diálogo para añadir categoría
  newCategoryName: string = '';
  selectedFile: File | null = null;
  categories: Categoria[] = [];
  favorites: Producto[] = [];
  selectedCategory: Categoria | null = null;
  highlightedProducts: ProductoConImagenes[] = []; // Lista de productos destacados

  @ViewChild(AddProductComponent) addProductComponent!: AddProductComponent;

  constructor(
    private serviceProduct: ServiceProductService,
    private renderer: Renderer2,
    private storage: Storage,
    @Inject(DOCUMENT) private document: Document,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private categoriaService: CategoriaService,
    private cdr: ChangeDetectorRef
    
  ) {}

  ngOnInit() {
    this.loadCategories();    
  }

  @HostListener('document:keydown.escape', ['$event'])
  onEscapeKey(event: KeyboardEvent): void {
    this.showMessage2();
    this.closeAddProductPanel();
  }

  showDialog() {
    this.displayAddCategoryDialog = true;
  }

  onDialogHide() {
    this.newCategoryName = '';
    this.selectedFile = null;
  }

  onFileSelect(event: any) {
    this.selectedFile = event.files[0];
  }

  async saveCategory() {
    if (this.newCategoryName && this.selectedFile) {
      try {
        const imageUrl = await this.uploadImageToFirebase(this.selectedFile);

       const nuevaCategoria: Categoria = {
         nombreCategoria: this.newCategoryName,
         imagenCategoria: imageUrl
       };
        this.categoriaService.agregarCategoria(nuevaCategoria).subscribe(
          response => {
            this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Categoría añadida exitosamente', life: 3000 });
            this.displayAddCategoryDialog = false;
            this.loadCategories(); // Refresh the categories list
          },
          error => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al añadir categoría', life: 3000 });
          }
        );
      } catch (error) {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al subir la imagen', life: 3000 });
      }
    }
  }
  
  async uploadImageToFirebase(file: File): Promise<string> {
    const storage = getStorage();
    const storageRef = ref(storage, `images/Categorias/${file.name}`);
    const snapshot = await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  }

  cancel() {
    this.displayAddCategoryDialog = false;
  }

  closeAddCategoryDialog() {
    this.displayAddCategoryDialog = false;
  }

  openNew(category: Categoria) {
    this.selectedCategory = category;
    this.displayAddProductPanel = true;    
    this.renderer.setStyle(this.document.body, 'overflow', 'hidden');
  }
  onCategorySelected(category: Categoria): void {
    this.selectedCategory = category;
    this.openNew(category);
  }

  closeAddProductPanel() {
    this.displayAddProductPanel = false;
    this.renderer.removeStyle(this.document.body, 'overflow');
    this.loadCategories();
  }

  showMessage(){
    this.messageService.add({ severity: 'info', summary: 'Confirmado', detail: 'Producto añadido con éxito' });
  }

  showMessage2(){
    this.messageService.add({ severity: 'warn', summary: 'Cancelado', detail: 'No añadiste ningún producto' });
  }

  onProductAdded() {
    this.displayAddProductPanel = false;
    this.showMessage();
  }

  saveProduct() {
    this.productDialog = false;
    this.product = this.createEmptyProduct();
    this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Producto guardado', life: 3000 });
  }

  deleteSelectedProducts(selectedProducts: Producto[]) {
    this.confirmationService.confirm({
      message: '¿Estás seguro de que deseas eliminar los productos seleccionados?',
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        selectedProducts.forEach((product) => {
          this.serviceProduct.eliminarProducto(product.idProducto).subscribe({
            next: () => {
              this.categories.forEach(category => {
                category.productos = category.productos?.filter(p => p.idProducto !== product.idProducto);
              });
              this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Productos eliminados', life: 3000 });
              this.loadCategories();
              // Forzar la detección de cambios
              this.cdr.detectChanges();
            },
            error: (error) => {
              this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar el producto', life: 3000 });
              console.error('Error al eliminar el producto', error);
            }
          });

        });
        this.selectedProducts = [];
      }
    });
  }
  
  deleteProduct(category: Categoria, product: Producto) {
    this.confirmationService.confirm({
      message: `¿Estás seguro de que deseas eliminar el producto ${product.nombreProducto}?`,
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.serviceProduct.eliminarProducto(product.idProducto).subscribe({
          next: () => {
            category.productos = category.productos?.filter(p => p.idProducto !== product.idProducto);
            this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Producto eliminado', life: 3000 });
            this.loadCategories();
          },
          error: (error) => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar el producto', life: 3000 });
            console.error('Error al eliminar el producto', error);
          }
        });
      }
    });
  }
  
  


  createEmptyProduct(): Producto {
    return {
      idProducto: 0,
      nombreProducto: '',
      imagenes: '',
      listPrecios: '',
      idCategoria: 0,
      descripcionProducto: '',
      listTags: '',
      cantVendido: 0,
      posicion: 0,
      destacado: false // Añade la propiedad 'destacado'
    };
  }

  isFavorite(product: Producto): boolean {
    return this.favorites.some(fav => fav.idProducto === product.idProducto);
  }

  addFavorite(product: Producto) {
    this.favorites.push(product);
    this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Producto añadido a favoritos', life: 3000 });
  }

  removeFavorite(product: Producto) {
    this.favorites = this.favorites.filter(fav => fav.idProducto !== product.idProducto);
    this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Producto eliminado de favoritos', life: 3000 });
  }

  getFavorites(): Producto[] {
    return this.favorites;
  }

  showSuccess() {
    this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Message Content' });
  }

  onTemplatedUpload() {
    this.messageService.add({ severity: 'info', summary: 'Success', detail: 'File Uploaded with Template' });
  }

  onSelectedFiles(event: any) {
    if (!Array.isArray(this.product.imagenes)) {
        this.product.imagenes = '';
    }

    if (this.product.imagenes.length > 0) {
        this.messageService.add({ severity: 'warn', summary: 'Advertencia', detail: 'Ya hay imágenes existentes. No se pueden agregar nuevas imágenes.' });
        this.fileUpload.clear();
    } else {
        let total = 0;
        event.files.forEach((file: any) => {
            total += file.size;
        });
        this.totalSize = total;
        this.totalSizePercent = (total / 1000000) * 100;

        event.files.forEach((file: any) => {
            const reader = new FileReader();
            reader.onload = (e: any) => {
                //this.product.Imagenes.push(e.target.result);
            };
            reader.readAsDataURL(file);
        });
    }
}

  getProduct() {        
    this.serviceProduct.getProducts().subscribe(data => {
    }, error => {
      console.error("error es: " );
    });
  }


  toggleAccordion(categoryName: string) {
    this.expandedCategories[categoryName] = !this.expandedCategories[categoryName];
    this.cdr.markForCheck();
  }


  loadCategories() {
    this.categoriaService.getCategorias().subscribe({
      next: (data: Categoria[]) => {
        this.categories = data.map(category => ({
          ...category,
          productos: category.productos?.map(product => ({
            ...product,
            imagenes: product.Imagenes ?? []  // Asegúrate de que imagenes esté definido
          })) ?? []
        }));
      },
      error: (error: any) => {
        console.error('Error fetching categories', error);
      }
    });
  }

  getProducts() {
    this.serviceProduct.getProducts().subscribe(
      (products) => {
        this.products = products;
        this.highlightedProducts = this.products.filter(product => product.destacado);
      },
      (error) => {
        console.error('Error fetching products', error);
      }
    );
  }

  toggleFavorite(product: Producto) {
    product.destacado = !product.destacado;

    if (product.destacado) {
      if (this.highlightedProducts.length < 12) {
        const updatedProduct = { ...product, posicion: this.highlightedProducts.length + 1 };
        this.addHighlightedProduct(updatedProduct);
      } else {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Máximo 12 productos en destacados', life: 3000 });
      }
    } else {
      const updatedProduct = { ...product, destacado: false, posicion: undefined };
      this.removeHighlightedProduct(updatedProduct);
    }
  }

  addHighlightedProduct(updatedProduct: Producto) {
    this.serviceProduct.actualizarProducto(updatedProduct).subscribe(
      () => {
        this.getProducts();
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Producto añadido a destacados', life: 3000 });
      },
      error => {
        console.error('Error actualizando el producto', error);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo añadir el producto a destacados', life: 3000 });
      }
    );
  }

  removeHighlightedProduct(updatedProduct: Producto) {
    this.serviceProduct.actualizarProducto(updatedProduct).subscribe(
      () => {
        this.getProducts();
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Producto eliminado de destacados', life: 3000 });
      },
      error => {
        console.error('Error actualizando el producto', error);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar el producto de destacados', life: 3000 });
      }
    );
  }
  

}
