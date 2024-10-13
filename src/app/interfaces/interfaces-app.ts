export interface Categoria {
    idCategoria?: number;
    nombreCategoria: string;
    imagenCategoria?: string;
    productos?: ProductoConImagenes[];
  }

export interface Tag{
  IdTag: number;
  NombreTag: string;
}
export interface Producto {
  idProducto: number;
  nombreProducto: string;
  idCategoria: number;
  imagenes: string;  // Nota: 'imagenes' en minúscula
  descripcionProducto: string;
  listPrecios?: string;
  listTags?: string;
  cantVendido?: number;
  posicion?: number;
  destacado?: boolean;
  idCategoriaNavigation?: Categoria;
  idTags?: Tag[];  // Añadir esta línea
}

export interface ProductoConImagenes {
  idProducto: number;
  nombreProducto: string;
  idCategoria: number;
  Imagenes: string[];
  DescripcionProducto: string;
  ListPrecios?: string;
  ListTags?: string;
  CantVendido?: number;
  posicion?: number;
  destacado?: boolean;
  idCategoriaNavigation?: Categoria;
  idTags?: Tag[];  // Añadir esta línea
}
export interface Banner {
  Id?: number;  // Usar '?' para indicar que puede ser opcional
  Posicion: number;
  Url: string;
  Titulo: string;
  Subtitulo: string;
}



  export interface Precio {
    IdPrecio: number;
    TamanhoPoster: string;
    PrecioMarco: number;
    PrecioPoster: number;
}

  
export interface CartItem {
  id: number;
  name: string;
  posterPrice: number; // Precio del póster
  framePrice: number;  // Precio del marco
  size: string;        // Medida seleccionada (TamanhoPoster)
  price: number;       // Precio total (póster + marco)
  quantity: number;    // Cantidad seleccionada
  image: string;       // Imagen del producto
  options?: { [key: string]: string }; // Opciones adicionales (si es necesario)
}



  export interface Region {
    Id: number;
    Nombre: string;
  }
  
  export interface Departamento {
    Id: number;
    Nombre: string;
    CodigoDane: number;
    RegionId: number;
  }
  
  export interface Municipio {
    Id: number;
    Nombre: string;
    CodigoDane: number;
    DepartamentoId: number;
    label?: string;  // Para el dropdown
    value?: number;  // Para el dropdown
  }
  

  export function isProducto(item: ProductoConImagenes | Categoria): item is ProductoConImagenes {
    return (item as ProductoConImagenes).nombreProducto !== undefined;
  }


  export interface InstagramPostDTO {
    Id: string;
    ImageUrl: string;
    Caption: string;
    CreatedAt: string;
  }



  export interface PayUResponse {
    referenceCode: string;
    transactionState: string;
    TX_VALUE: number;
    currency: string;
    processingDate: string;
    lapPaymentMethod: string;
    description: string;
  }
  


  export interface Product {
    ProductId: number;
    ProductName: string;
    TamanhoPoster: string;
    PrecioPoster: number;
    PrecioMarco: number;
    Cantidad: number;
    Subtotal: number;
    ProductImageUrl: string;
  }
  
  export interface OrderDetails {
    ReferenceCode: string;
    TotalAmount: number;
    Currency: string;
    OrderStatus: string;
    CreatedAt: string;
    UpdatedAt: string;
    Products: {
      $values: Product[];
    };
  }
  
  