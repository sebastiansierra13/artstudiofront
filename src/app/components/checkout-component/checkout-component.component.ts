import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { StepperModule } from 'primeng/stepper';
import { StepsModule } from 'primeng/steps';
import { FloatingButtonsComponent } from "../floating-buttons/floating-buttons.component";
import { FooterComponent } from "../footer/footer.component";
import { OrderSummaryComponent } from '../order-summary/order-summary.component';
import { NavBarComponent } from "../nav-bar/nav-bar.component";
import { LocationService } from '../../services/location.service';
import { CartItem, Departamento, Municipio, Region } from '../../interfaces/interfaces-app';
import { Subscription } from 'rxjs';
import { OrderService } from '../../services/order.service';
import { PayUService } from '../../services/pay-u.service';
import { Router,RouterModule } from '@angular/router';

@Component({
    selector: 'app-checkout',
    standalone: true,
    templateUrl: './checkout-component.component.html',
    styleUrls: ['./checkout-component.component.css'],
    imports: [
        CommonModule,
        FormsModule,
        CheckboxModule,
        InputTextModule,
        ButtonModule,
        DropdownModule,
        InputTextareaModule,
        StepperModule,
        StepsModule,
        FloatingButtonsComponent,
        FooterComponent,
        NavBarComponent,
        RouterModule,
        OrderSummaryComponent
    ]
})
export class CheckoutComponent implements OnInit {

  @ViewChild('payuForm', { static: false }) payuForm!: ElementRef;
  
  activeIndex: number = 0;
  firstName: string = '';
  lastName: string = '';
  streetName: string = '';
  apartment: string = '';
  city: string = '';
  postcode: string = '';
  neighborhood: string = '';
  phone: string = '';
  email: string = '';
  orderNotes: string = '';
  selectedDepartment: Departamento | null = null;
  selectedCity: Municipio | null = null;
  departments: Departamento[] = [];
  municipalities: Municipio[] = [];
  selectedDepartmentId: number | null = null;
  selectedMunicipalityId: number | null = null;
  buyerFullName = this.firstName + this.lastName;
  paymentSuccess: boolean = false; // Indica si el pago fue exitoso

  // Validaciones del formulario
  formValid: boolean = false;

  shipToDifferentAddress: boolean = false;
  addressConfirmed: boolean = false;
  emailUpdates: boolean = false;
  couponCode: string = '';
  steps: any[] = [
    { label: 'Detalles de Pedido' },
    { label: 'Pedido Completo' }
  ];

  regions: Region[] = [];

  orderItems: CartItem[] = [];
  total: number = 0;
  private orderSubscription: Subscription | undefined;
  private totalSubscription: Subscription | undefined;
  shippingCost: number = 0;
  private shippingSubscription: Subscription | undefined;

  formErrors: { [key: string]: string } = {};

  constructor(private payUService: PayUService, private router: Router, private locationService: LocationService,private orderService: OrderService) {
    this.calculateTotal();
  }

  ngOnInit() {
    this.loadOrderItems(); // Cargar los productos desde localStorage
    this.loadRegions();
    this.loadDepartments();
    
   
    // Suscripción a los productos del carrito
    this.orderService.orderItems$.subscribe(items => {
      if (items.length === 0 && this.orderItems.length > 0) {
        // Emitir los productos cargados desde localStorage si el carrito está vacío
        this.orderService.setOrderItems(this.orderItems);
      } else {
        this.updateOrderItems(items);
      }
    });
    
    this.orderService.shippingInfo$.subscribe(info => {
      if (this.selectedDepartmentId !== info.departmentId || this.selectedMunicipalityId !== info.municipalityId || this.shippingCost !== info.shippingCost) {
        this.selectedDepartmentId = info.departmentId;
        this.selectedMunicipalityId = info.municipalityId;
        this.shippingCost = info.shippingCost;
        if (this.selectedDepartmentId) {
          this.loadMunicipalities();
        }
        this.updateTotalCost();
      }
    });
  
    this.orderService.totalCost$.subscribe(cost => {
      this.total = cost;
    });
  
    this.loadCheckoutData();
  }
  

  // Guardar los productos en localStorage cada vez que cambien
  saveOrderItems() {
    if (this.orderItems.length > 0) {
      localStorage.setItem('orderItems', JSON.stringify(this.orderItems));
    } else {
    }
  }

  // Cargar los productos desde localStorage al iniciar el componente
  loadOrderItems() {
    const storedItems = localStorage.getItem('orderItems');

    if (storedItems) {
      this.orderItems = JSON.parse(storedItems);
      this.updateTotalCost(); // Actualizar el costo total al cargar los ítems
    } else {
    }
  }

  // Actualizar los productos y guardar en localStorage
  updateOrderItems(items: CartItem[]) {
    this.orderItems = items;
    this.updateTotalCost(); // Actualizar el costo total
    this.saveOrderItems();  // Guardar los ítems en localStorage
  }

// Método para procesar el pedido y crear el formulario de pago
createPayment() {
  this.validateForm();

  if (!this.formValid) {
    console.error('Formulario no válido. Verifica los campos.');
    return;
  }

  
  console.log('Departamento seleccionado:', this.selectedDepartmentId);
  console.log('Municipio seleccionado:', this.selectedMunicipalityId);
  console.log('Ciudad:', this.city);
  // Datos del pedido que se enviarán al backend
  const payUFormDTO = {
    productos: this.orderItems.map(item => ({
      IdProducto: item.id,  // ID del producto
      NombreProducto: item.name,
      TamanhoPoster: item.size, // Tamaño del producto (póster)
      PrecioPoster: item.posterPrice, // Precio del póster
      PrecioMarco: item.framePrice, // Precio del marco
      Cantidad: item.quantity // Cantidad seleccionada del producto
    })),
    BuyerEmail: this.email, // Correo del comprador
    Total: this.total, // Total del pedido

    // Información adicional del comprador desde el formulario del checkout
    FirstName: this.firstName,
    LastName: this.lastName,
    StreetName: this.streetName,
    Apartment: this.apartment,
    Neighborhood: this.neighborhood,
    City: this.onMunicipalityChange()|| 'Ciudad no definida',  // Verifica que `selectedCity` esté definido
    Department: this.onDepartmentChange()|| 'Departamento no definido',  // Verifica que `selectedDepartment` esté definido
    Postcode: this.postcode,
    Phone: this.phone,
    OrderNotes: this.orderNotes
  };

  console.log('Datos del pedido que se enviarán al backend:', payUFormDTO);

   // Enviar los datos al backend para crear el formulario de pago
   this.payUService.createPaymentForm(payUFormDTO).subscribe(
    (response) => {
      if (response) {
        console.log('Formulario de pago creado con éxito:', response);
        
        console.log('Datos del pedido que se enviarán al backend:', response);
        this.payUService.createOrder(response).subscribe(
          (paymentResponse) => {
            if (paymentResponse) {
              console.log("OJITOOOO" + paymentResponse);
              this.populateAndSubmitForm(response); // Poblamos y enviamos el formulario de pago              
            }
          },
          (error) => {
            console.error('Error al crear el formulario de pago:', error);
          }
        );
      }
    },
    (error) => {
      console.error('Error al crear la orden:', error);
    }
  );
}



// Método para construir el formulario y enviarlo automáticamente
populateAndSubmitForm(formData: any) {
  // Crear un formulario HTML dinámico
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = 'https://checkout.payulatam.com/ppp-web-gateway-payu/'; // URL de sandbox de PayU

  // Crear campos ocultos con los datos recibidos del backend
  Object.keys(formData).forEach(key => {
    if (typeof formData[key] !== 'object') {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = formData[key];
      form.appendChild(input);
    }
  });

  // Añadir el campo de monto total (valor)
  const totalInput = document.createElement('input');
  totalInput.type = 'hidden';
  totalInput.name = 'amount';  // O "valor", dependiendo de la API de PayU
  totalInput.value = formData.Total.toString(); // Asegúrate de que sea un valor numérico correcto
  form.appendChild(totalInput);
  console.log(totalInput);

  // Añadir el formulario al DOM y enviarlo automáticamente
  document.body.appendChild(form);
  form.submit(); // Enviar el formulario automáticamente
}





validateForm() {
  // Validar campos vacíos
  if (!this.firstName || !/^[A-Za-z]+$/.test(this.firstName)) {
    console.error('Nombre es inválido o está vacío.');
  }
  if (!this.lastName || !/^[A-Za-z]+$/.test(this.lastName)) {
    console.error('Apellido es inválido o está vacío.');
  }
  if (!this.email) {
    console.error('Correo electrónico está vacío.');
  }
  if (!this.streetName) {
    console.error('Dirección está vacía.');
  }
  if (!this.city) {
    console.error('Ciudad está vacía.');
  }
  if (!this.phone || !/^\d+$/.test(this.phone) || this.phone.length < 10) {
    console.error('Teléfono es inválido o está vacío.');
  }
  if (!this.neighborhood) {
    console.error('Barrio está vacío.');
  }

  // Si algo está vacío o inválido, marcar el formulario como no válido
  if (!this.firstName || !this.lastName || !this.email || !this.streetName || !this.city || !this.phone || !this.neighborhood) {
    this.formValid = false;
    console.error('Algunos campos requeridos están vacíos o son inválidos.');
    return;
  }

  // Validar formato de correo electrónico
  if (!this.isValidEmail(this.email)) {
    this.formValid = false;
    console.error('El correo electrónico no es válido.');
    return;
  }

  this.formValid = true;
}

// Validar que solo se ingresen letras en nombre y apellido
validateName(event: KeyboardEvent) {
  const char = String.fromCharCode(event.which);
  const pattern = /^[A-Za-z]+$/; // Solo letras
  if (!pattern.test(char)) {
    event.preventDefault(); // Previene la entrada de caracteres no válidos
  }
}

// Validar que solo se ingresen números en el código postal
validatePostcode(event: KeyboardEvent) {
  const char = String.fromCharCode(event.which);
  const pattern = /^[0-9]$/; // Solo números
  if (!pattern.test(char)) {
    event.preventDefault(); // Previene la entrada de caracteres no válidos
  }
}

// Validar que solo se ingresen números en el teléfono
validatePhone(event: KeyboardEvent) {
  const char = String.fromCharCode(event.which);
  const pattern = /^[0-9]$/; // Solo números
  if (!pattern.test(char)) {
    event.preventDefault(); // Previene la entrada de caracteres no válidos
  }
}


// Validación básica de formato de correo
isValidEmail(email: string): boolean {
  const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
  return emailPattern.test(email);
}


loadDepartments() {
  this.locationService.getDepartments().subscribe(
    departments => {
      this.departments = departments.map(dep => ({
        ...dep,
        label: dep.Nombre,
        value: dep.Id
      }));
    },
    error => console.error('Error cargando departamentos:', error)
  );
}

loadMunicipalities() {
  if (this.selectedDepartmentId) {
    this.locationService.getMunicipalities().subscribe(
      municipalities => {
        this.municipalities = municipalities
          .filter(m => m.DepartamentoId === this.selectedDepartmentId)
          .map(m => ({
            ...m,
            label: m.Nombre,
            value: m.Id
          }));
      },
      error => console.error('Error cargando municipios:', error)
    );
  } else {
    this.municipalities = [];  // Vaciar municipios si no hay departamento seleccionado
  }
}

onDepartmentChange() {
  if (this.selectedDepartmentId) {
    this.loadMunicipalities();
    this.selectedMunicipalityId = null;
  } else {
    this.municipalities = [];
  }

  const selectedDepartment = this.departments.find(dep => dep.Id === this.selectedDepartmentId);
  
  if (selectedDepartment) {
    this.selectedDepartment = selectedDepartment;
    
  } else {
    this.selectedDepartment = null;
    console.log('Ningún departamento seleccionado.');
  }
  
  return this.selectedDepartment?.Nombre;
}

onMunicipalityChange() {
  const selectedMunicipality = this.municipalities.find(m => m.Id === this.selectedMunicipalityId);
  
  if (selectedMunicipality) {
    this.city = selectedMunicipality.Nombre;
    
  } else {
    console.log('Ningún municipio seleccionado.');
    this.city = '';
  }

  return this.city;
}

  
  updateTotalCost() {
    const subtotal = this.orderItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    this.total = subtotal; // El total es igual al subtotal ya que el envío es gratuito
    this.orderService.setTotalCost(this.total);
    this.orderService.setShippingInfo({
      departmentId: this.selectedDepartmentId,
      municipalityId: this.selectedMunicipalityId,
      shippingCost: 0 // Siempre 0 para envío gratuito
    });
    this.saveCheckoutData();
  }
  
  ngOnDestroy() {
    if (this.orderSubscription) this.orderSubscription.unsubscribe();
    if (this.totalSubscription) this.totalSubscription.unsubscribe();
    if (this.shippingSubscription) this.shippingSubscription.unsubscribe();
  }

  loadRegions() {
    this.locationService.getRegions().subscribe(
      regions => {
        this.regions = regions;
      },
      error => console.error('Error loading regions:', error)
    );
  }

 

  calculateTotal(): number {
    return this.orderItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  }


  nextStep() {
    if (this.activeIndex < this.steps.length - 1) {
      this.activeIndex++;
    }
  }

  previousStep() {
    if (this.activeIndex > 0) {
      this.activeIndex--;
    }
  }

  confirmAddress() {
    this.addressConfirmed = true;
    this.nextStep();
  }



  saveCheckoutData() {
    const checkoutData = {
      firstName: this.firstName,
      lastName: this.lastName,
      streetName: this.streetName,
      apartment: this.apartment,
      selectedDepartmentId: this.selectedDepartmentId,
      selectedMunicipalityId: this.selectedMunicipalityId,
      postcode: this.postcode,
      phone: this.phone,
      email: this.email,
      orderNotes: this.orderNotes,
      shippingCost: this.shippingCost,
      neighborhood: this.neighborhood,
      total: this.total,
      orderItems: this.orderItems // Guardamos también los items del pedido
    };
    localStorage.setItem('checkoutData', JSON.stringify(checkoutData));
  }
  
  loadCheckoutData() {
    const savedData = localStorage.getItem('checkoutData');
    if (savedData) {
      const checkoutData = JSON.parse(savedData);
      this.firstName = checkoutData.firstName || '';
      this.lastName = checkoutData.lastName || '';
      this.streetName = checkoutData.streetName || '';
      this.apartment = checkoutData.apartment || '';
      this.selectedDepartmentId = checkoutData.selectedDepartmentId || null;
      this.selectedMunicipalityId = checkoutData.selectedMunicipalityId || null;
      this.postcode = checkoutData.postcode || '';
      this.phone = checkoutData.phone || '';
      this.email = checkoutData.email || '';
      this.neighborhood = checkoutData.neighborhood || '';
      this.orderNotes = checkoutData.orderNotes || '';
      this.shippingCost = checkoutData.shippingCost || 0;
      this.total = checkoutData.total || 0;
      this.orderItems = checkoutData.orderItems || [];
  
      if (this.selectedDepartmentId) {
        this.loadMunicipalities();
      }
      this.updateTotalCost(); // Actualizar el costo total
    }
  }



  // Método para construir la dirección de envío
  getShippingAddress() {
    return `${this.streetName}, ${this.neighborhood}, ${this.selectedMunicipalityId}, ${this.selectedDepartmentId}, ${this.postcode}`;
  }
}