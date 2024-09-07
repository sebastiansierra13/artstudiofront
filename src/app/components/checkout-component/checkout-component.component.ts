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
import { NavBarComponent } from "../nav-bar/nav-bar.component";
import { LocationService } from '../../services/location.service';
import { CartItem, Departamento, Municipio, Region } from '../../interfaces/interfaces-app';
import { Subscription } from 'rxjs';
import { OrderService } from '../../services/order.service';
import { PayUService } from '../../services/pay-u.service';

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
        NavBarComponent
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
  formValid: boolean = false;

  constructor(private payUService: PayUService, private locationService: LocationService,private orderService: OrderService) {
    this.calculateTotal();
  }

  ngOnInit() {
    this.loadRegions();
    this.loadDepartments();
    
    this.orderService.orderItems$.subscribe(items => {
      this.orderItems = items;
      this.updateTotalCost();
    });
  
    this.orderService.shippingInfo$.subscribe(info => {
      console.log('Shipping info recibida:', info);
      this.selectedDepartmentId = info.departmentId;
      this.selectedMunicipalityId = info.municipalityId;
      this.shippingCost = info.shippingCost;
      
      if (this.selectedDepartmentId) {
        this.loadMunicipalities();
      }
      
      this.updateTotalCost();
    });
  
    this.orderService.totalCost$.subscribe(cost => {
      this.total = cost;
    });
  
    this.loadCheckoutData();
  }

  createPayment() {
    if (!this.formValid) {
      this.validateForm();
      return;
    }
  
    const orderData = {
      merchantId: '1011854', // Asegúrate de obtener esto de la configuración
      referenceCode: `Order-${Date.now()}`, // Genera un código único
      accountId: '1020700', // Asegúrate de obtener esto de la configuración
      description: `Pedido de ${this.firstName} ${this.lastName}`,
      currency: 'COP',
      amount: this.total,
      tax: 0, // Calcula el impuesto si es necesario
      taxReturnBase: 0, // Calcula la base de retorno de impuestos si es necesario
      buyerEmail: this.email,
      telephone: this.phone,
      buyerFullName: `${this.firstName} ${this.lastName}`,
      payerEmail: this.email,
      payerPhone: this.phone,
      payerFullName: `${this.firstName} ${this.lastName}`,
      payerDocument: '1312321', // Añade un campo para el documento del pagador si es necesario
      payerDocumentType: 'cc', // Añade un campo para el tipo de documento del pagador si es necesario
      shippingAddress: this.getShippingAddress(),
      shippingCity: this.selectedCity?.Nombre || '',
      shippingCountry: 'CO'
    };
  
    this.payUService.createPaymentForm(orderData).subscribe(
      response => {
        if (response && response.formHtml) {
          // Si PayU devuelve el HTML del formulario, insértalo en el DOM y envíalo
          this.payuForm.nativeElement.innerHTML = response.formHtml;
          this.payuForm.nativeElement.submit();
        } else if (response && response.paymentUrl) {
          // Si PayU devuelve una URL de pago, redirige a ella
          window.location.href = response.paymentUrl;
        } else {
          console.error('Respuesta inesperada del servidor:', response);
          // Muestra un mensaje de error al usuario
        }
      },
      error => {
        console.error('Error al crear el formulario de pago:', error);
        // Muestra un mensaje de error al usuario
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

  updateOrderItems(items: CartItem[]) {
    this.orderItems = items;
    this.updateTotalCost(); // Esto ya llama a saveCheckoutData()
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

  placeOrder() {
    this.validateForm();
    
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
      this.activeIndex = 1; // Navegar al paso de pedido completo
      localStorage.removeItem('checkoutData');
    } else {
      console.log('Por favor, completa todos los campos requeridos');
    }
  }


  validateForm() {
    this.formErrors = {};
    this.formValid = true;
  
    if (!this.firstName.trim()) {
      this.formErrors['firstName'] = 'El nombre es requerido';
      this.formValid = false;
    }
    if (!this.lastName.trim()) {
      this.formErrors['lastName'] = 'El apellido es requerido';
      this.formValid = false;
    }
    if (!this.streetName.trim()) {
      this.formErrors['streetName'] = 'La dirección es requerida';
      this.formValid = false;
    }
    if (!this.postcode.trim()) {
      this.formErrors['postcode'] = 'El código postal es requerido';
      this.formValid = false;
    }
    if (!this.apartment.trim()) {
      this.formErrors['apartment'] = 'Ingresa al menos un detalle antes de continuar';
      this.formValid = false;
    }
    if (!this.postcode.trim()) {
      this.formErrors['postcode'] = 'El código postal es requerido';
      this.formValid = false;
    }
    if (!this.apartment.trim()) {
      this.formErrors['apartment'] = 'Ingresa al menos un detalle antes de continuar';
      this.formValid = false;
    }
    if (!this.neighborhood.trim()) {
      this.formErrors['neighborhood'] = 'El barrio es requerido';
      this.formValid = false;
    }
    if (!this.phone.trim()) {
      this.formErrors['phone'] = 'El teléfono es requerido';
      this.formValid = false;
    }
    if (!this.email.trim()) {
      this.formErrors['email'] = 'El correo electrónico es requerido';
      this.formValid = false;
    } else if (!this.isValidEmail(this.email)) {
      this.formErrors['email'] = 'El correo electrónico no es válido';
      this.formValid = false;
    }
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