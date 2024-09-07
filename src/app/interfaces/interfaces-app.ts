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
    price: number;
    quantity: number;
    image: string;
    options?: { [key: string]: string };
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
