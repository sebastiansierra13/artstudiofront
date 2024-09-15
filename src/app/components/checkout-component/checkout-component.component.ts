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

  @ViewChild('payuForm') payuForm!: ElementRef;
  
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
        console.log('Productos recibidos desde el carrito:', items);
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
      console.log('Productos guardados en localStorage:', this.orderItems);
    } else {
      console.log('No hay productos para guardar en localStorage.');
    }
  }

  // Cargar los productos desde localStorage al iniciar el componente
  loadOrderItems() {
    const storedItems = localStorage.getItem('orderItems');
    console.log('Cargando productos desde localStorage:', storedItems);

    if (storedItems) {
      this.orderItems = JSON.parse(storedItems);
      console.log('Productos cargados desde localStorage:', this.orderItems);
      this.updateTotalCost(); // Actualizar el costo total al cargar los ítems
    } else {
      console.log('No se encontraron productos en localStorage.');
    }
  }

  // Actualizar los productos y guardar en localStorage
  updateOrderItems(items: CartItem[]) {
    this.orderItems = items;
    console.log('Actualizando productos del carrito:', this.orderItems);
    this.updateTotalCost(); // Actualizar el costo total
    this.saveOrderItems();  // Guardar los ítems en localStorage
  }

  placeOrder() {
    // Validar el formulario antes de proceder
    this.validateForm();
    
    // Si el formulario es válido, proceder con el pedido
    if (this.formValid) {
      console.log('Pedido realizado exitosamente');
      console.log('Detalles del pedido:', {
        firstName: this.firstName,
        lastName: this.lastName,
        streetName: this.streetName,
        apartment: this.apartment,
        city: this.selectedCity?.Nombre,
        postcode: this.postcode,
        phone: this.phone,
        email: this.email,
        orderNotes: this.orderNotes,
        neighborhood: this.neighborhood,
        selectedDepartment: this.selectedDepartment?.Nombre,
        selectedCity: this.selectedCity?.Nombre,
        couponCode: this.couponCode,
        emailUpdates: this.emailUpdates,
        shipToDifferentAddress: this.shipToDifferentAddress,
        shippingCost: this.shippingCost,
        total: this.total
      });

      // Avanzar al paso de "Pedido Completo"
      this.activeIndex = 1;

      // Eliminar los productos del carrito y datos de checkout del localStorage
      localStorage.removeItem('orderItems');
      localStorage.removeItem('checkoutData');
    } else {
      // Mostrar mensaje de error si el formulario no está completo
      console.log('Por favor, completa todos los campos requeridos');
    }
}

validateForm() {
  this.formValid = this.firstName && this.lastName && this.streetName && this.city && this.phone && this.email ? true : false;
}

// Método para procesar el pedido y crear el formulario de pago
createPayment() {
  this.validateForm();

  if (!this.formValid) {
    console.error('Formulario no válido. Verifica los campos.');
    return;
  }

  // Datos del pedido que se enviarán al backend
  const orderData = {
    firstName: this.firstName,
    lastName: this.lastName,
    streetName: this.streetName,
    neighborhood: this.neighborhood,
    city: this.city,
    phone: this.phone,
    email: this.email,
    total: this.total
  };

  // Llamada al backend para generar el formulario PayU
  this.payUService.createPaymentForm(orderData).subscribe(
    response => {
      if (response && response.formHtml) {
        // Si PayU devuelve el HTML del formulario, insértalo en el DOM
        this.payuForm.nativeElement.innerHTML = response.formHtml;
        this.payuForm.nativeElement.submit(); // Enviar el formulario
      } else if (response && response.paymentSuccess !== undefined) {
        // Si PayU devuelve el estado del pago
        this.paymentSuccess = response.paymentSuccess;
        this.activeIndex = 1; // Cambia a la pantalla de "Pedido Completo"
      } else {
        console.error('Error al generar el formulario de PayU:', response);
      }
    },
    error => {
      console.error('Error al crear el formulario de pago:', error);
    }
  );
}

  private populateAndSubmitForm(formData: any) {
    const form = this.payuForm.nativeElement;
    
    // Limpiar el formulario existente
    while (form.firstChild) {
      form.removeChild(form.firstChild);
    }
    // Crear y añadir los campos del formulario
    Object.keys(formData).forEach(key => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = formData[key];
      form.appendChild(input);
    });

    // Enviar el formulario
    form.submit();
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
    }
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

  onDepartmentChange() {
    if (this.selectedDepartmentId) {
      this.loadMunicipalities();
      this.selectedMunicipalityId = null;
    } else {
      this.municipalities = [];
    }
    this.updateTotalCost();
  }

  onMunicipalityChange() {
    this.updateTotalCost();
  }

  

calculateShipping() {
  if (this.selectedDepartment === null) {
    this.shippingCost = 0;
    return;
  }

  const selectedDepartment = this.departments.find(dep => dep.Id === this.selectedDepartmentId);
  if (!selectedDepartment) {
    this.shippingCost = 0;
    return;
  }

  const region = this.regions.find(r => r.Id === selectedDepartment.RegionId);
  if (region) {
    // Aquí deberías tener una lógica para determinar el costo de envío basado en la región
    // Por ahora, usaremos un valor fijo para cada región
    const shippingRates: { [key: number]: number } = {
      1: 8000,   // Bogotá
      2: 12000,  // Región Eje Cafetero
      3: 14000,  // Región Centro Oriente
      4: 18000,  // Región Caribe
      5: 18000,  // Región Pacífico
      6: 16000,  // Región Llano
      7: 14000,  // Región Centro Sur
    };
    this.shippingCost = shippingRates[region.Id] || 0;
  } else {
    this.shippingCost = 0;
  }
  this.orderService.setShippingInfo({
    departmentId: this.selectedDepartmentId,
    municipalityId: this.selectedMunicipalityId,
    shippingCost: this.shippingCost
  });
  this.updateTotalCost();
  this.saveCheckoutData();
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

  
  isValidEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
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
      this.calculateShipping(); // Recalcular el envío
      this.updateTotalCost(); // Actualizar el costo total
    }
  }



  // Método para construir la dirección de envío
  getShippingAddress() {
    return `${this.streetName}, ${this.neighborhood}, ${this.selectedMunicipalityId}, ${this.selectedDepartmentId}, ${this.postcode}`;
  }
}