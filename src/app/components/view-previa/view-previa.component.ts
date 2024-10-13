import { Component, Input, OnInit } from '@angular/core';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormBuilder, FormsModule } from '@angular/forms';
import { NavBarComponent } from '../nav-bar/nav-bar.component';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { CarouselModule } from 'primeng/carousel';
import { TagModule } from 'primeng/tag';
import { MatDividerModule } from '@angular/material/divider';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { Categoria, Precio, Producto, ProductoConImagenes } from '../../interfaces/interfaces-app';
import { CategoriaService } from '../../services/categoria.service';
import { FooterComponent } from "../footer/footer.component";
import { FloatingButtonsComponent } from "../floating-buttons/floating-buttons.component";
import { ActivatedRoute, Router } from '@angular/router';
import { ServiceProductService } from '../../services/service-product.service';
import { error } from 'console';
import { PrecioService } from '../../services/precio.service';
import { CartService } from '../../services/cart.service';
import { CartItem } from '../../interfaces/interfaces-app';
import { TooltipModule } from 'primeng/tooltip';
import { HomeDestacadosComponent } from "../home-destacados/home-destacados.component";
import { OrderService } from '../../services/order.service';

@Component({
    selector: 'app-view-previa',
    standalone: true,
    templateUrl: './view-previa.component.html',
    styleUrls: ['./view-previa.component.css'],
    imports: [TooltipModule, CommonModule, ScrollPanelModule, MatDividerModule, DropdownModule, InputNumberModule, MatFormFieldModule, FormsModule, NavBarComponent, ButtonModule, ToggleButtonModule, ReactiveFormsModule, CardModule, ButtonModule, CarouselModule, TagModule, FooterComponent, FloatingButtonsComponent, HomeDestacadosComponent]
})
export class ViewPreviaComponent implements OnInit {
  responsiveOptions: any[] | undefined;
  imgSelect: String = '';
  quantity: number = 1;
  _wrap: boolean = true;
  nodes: Precio[] = [];
  products :Producto []=[];
  selectedNodes!: Precio;
  imgaServices: string[] = [];
  imagenSeleccionada: string = '';
  formGroup!: FormGroup;
  categorias: Categoria[] = [];
  producto: ProductoConImagenes | null = null;
  precioMarco: number = 0;
  product: ProductoConImagenes | undefined;
  productosRelacionados: ProductoConImagenes[] = [];
  productName: string | null = null;
  precios: Precio[] = [];
  medidas: string[] = [];
  precioSeleccionado: number =0;
  subtotal: number = 0;
  marcoAgregado: boolean = false;

  isOptionsSelected: boolean = false;

  

  constructor(private cartService: CartService, private fb: FormBuilder , private router: Router,private route: ActivatedRoute,private categoriaService: CategoriaService ,  private serviceProduct:ServiceProductService , private servicePrecio:PrecioService, private orderService:OrderService) {
    this.imagenSeleccionada = this.imgaServices[0];
    this.formGroup = this.fb.group({
      checked: [false]
    });

    
  }

  ngOnInit() {
    this.loadMedidas();
    this.loadCategorias();

    const id = this.route.snapshot.params['id'];
    this.serviceProduct.getProductByID(id).subscribe((producto) => {
      this.product = producto;
      this.loadProductosRelacionados(producto);
    });


    this.route.paramMap.subscribe(params => {
      this.productName = params.get('nombre');
      const id = params.get('id');
      if (id) {
        this.loadProductDetails(+id);
      } else {
        console.error('ID de producto no proporcionado');
      }
    });


    let idParam = this.route.snapshot.paramMap.get('id');
    let idProducto!: number;

    if (idParam !== null) {
      idProducto = parseInt(idParam, 10);
    }
    
    
    this.serviceProduct.getProductByID(idProducto).subscribe((data)=>{
    }, error => {
      console.error("error es: " );
    });


    this.formGroup = new FormGroup({
      checked: new FormControl<boolean>(false)
    });

    this.responsiveOptions = [
      {
        breakpoint: '1199px',
        numVisible: 1,
        numScroll: 1
      },
      {
        breakpoint: '991px',
        numVisible: 2,
        numScroll: 1
      },
      {
        breakpoint: '767px',
        numVisible: 1,
        numScroll: 1
      }
    ];
    this.formGroup.get('checked')?.valueChanges.subscribe((value: boolean) => {
      this.marcoAgregado = value;
      this.actualizarPrecioTotal();
    });

    
  }
  sumarValores(): void {
    if (this.selectedNodes && this.selectedNodes.PrecioMarco !== undefined) {
      let suma = this.selectedNodes.PrecioMarco * this.quantity;

      if (this.marcoAgregado) {
        this.precioSeleccionado += suma;
      } else {
        this.precioSeleccionado -= suma;
      }
    } else {
    }
  }
  
  

  loadCategorias(){
    // Llamar al servicio para obtener las categorías
    this.categoriaService.getCategorias().subscribe(
      data => {
        this.categorias = data;
      },
      error => console.error('Error fetching categories:', error)
    );    
  }
  
  loadMedidas(){
    // Llamar al servicio para obtener las categorías
    this.servicePrecio.getPrecios().subscribe(
      data => {
        this.nodes = data;
      },
      error => console.error('Error fetching categories:', error)
    );    
  }

  loadProductDetails(id: number) {
    this.serviceProduct.getProductByID(id).subscribe(
      (product: ProductoConImagenes) => {
        this.product = product;
        this.imagenSeleccionada = product.Imagenes[0] || '';
        this.imgaServices = product.Imagenes;
        
        if (this.productName && this.productName !== product.nombreProducto) {
          console.warn('El nombre en la URL no coincide con el nombre del producto');
        }
      },
      error => {
        console.error('Error al cargar los detalles del producto:', error);
      }
    );
  }

  seleccionarImagen(imagen: string) {
    this.imagenSeleccionada = imagen;
  }

  onImageClick(imageUrl: string) {
    this.imgSelect = imageUrl; // Almacenar la URL de la imagen seleccionada en imgSelect
  }

  increment(): void {
    if (this.quantity < 100) {
      this.quantity++;
      this.actualizarPrecioTotal();
    }
  }

  decrement(): void {
    if (this.quantity > 1) {
      this.quantity--;
      this.actualizarPrecioTotal();
    }
  }
  actualizarPrecioTotal(): void {
    if (this.selectedNodes && this.selectedNodes.PrecioPoster !== undefined) {
      this.precioSeleccionado = this.selectedNodes.PrecioPoster * this.quantity;
  
      if (this.marcoAgregado && this.selectedNodes.PrecioMarco !== undefined) {
        this.precioSeleccionado += this.selectedNodes.PrecioMarco * this.quantity;
      }
      this.updateIsOptionsSelected();
    } else {
      this.precioSeleccionado = 0;
      this.isOptionsSelected = false;
    }
  
  }

  onInput(event: Event) {
    const input = event.target as HTMLInputElement;
    let value = parseInt(input.value, 10);
    if (isNaN(value)) {
      value = 1;
    }
    value = Math.max(1, Math.min(100, value));
    this.quantity = value;
  }

  selectCategory(category: Categoria) {
    this.router.navigate(['/list-products',category.nombreCategoria,category.idCategoria]);
  }

  onNodeSelect() {
    if (this.selectedNodes) {
      this.actualizarPrecioTotal();
      this.updateIsOptionsSelected();
    } else {
      this.precioSeleccionado = 0;
    }
  }
  
  updateIsOptionsSelected() {
    this.isOptionsSelected = this.selectedNodes !== null && this.precioSeleccionado > 0;
  }

  addToCart() {
    if (this.product && this.selectedNodes) {
      const selectedSize = this.selectedNodes?.TamanhoPoster || 'Tamaño no definido';
      const precioPoster = this.selectedNodes.PrecioPoster; // Eliminar la multiplicación por cantidad
      const precioMarco = this.formGroup.get('checked')?.value ? this.selectedNodes.PrecioMarco : 0; // Eliminar la multiplicación por cantidad
  
      if (!selectedSize || precioPoster <= 0) {
        console.error('Debe seleccionar un tamaño y el precio correspondiente.');
        return;
      }
  
      const cartItem: CartItem = {
        id: this.product.idProducto,
        name: this.product.nombreProducto,
        posterPrice: precioPoster, // Aquí solo se envía el precio unitario
        framePrice: precioMarco,  // Aquí solo se envía el precio unitario
        size: selectedSize,
        price: precioPoster + precioMarco, // Total unitario (posterPrice + framePrice)
        quantity: this.quantity || 1,
        image: this.product.Imagenes?.[0] || '',
        options: {
          size: selectedSize,
          frame: this.formGroup.get('checked')?.value ? 'Sí' : 'No'
        }
      };
  
      if (!cartItem.posterPrice || !cartItem.size) {
        console.error('Producto mal formado antes de agregarlo al carrito:', cartItem);
        return;
      }
  
      // Agregar el producto al carrito
      this.cartService.addToCart(cartItem);
  
      this.resetQuantity();
    } else {
      console.error('Producto o nodos seleccionados no definidos.');
    }
  }
  
  
  
  
  
 
  private resetQuantity() {
    this.quantity = 1;
  }
  
  loadProductosRelacionados(producto: ProductoConImagenes) {
    const productoId = producto.idProducto; // Asegúrate de que este campo tiene un valor válid

    if (productoId) {
        this.serviceProduct.getRelatedProducts(productoId).subscribe(
            (relacionados) => {
                this.productosRelacionados = relacionados;
            },
            (error) => {
                console.error('Error al obtener productos relacionados:', error);
            }
        );
    } else {
        console.error('ID del producto no disponible');
    }
}

}





