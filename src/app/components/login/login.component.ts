import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators,ReactiveFormsModule  } from '@angular/forms';
import { Router,RouterModule } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [MatFormFieldModule,MatCardModule,ReactiveFormsModule,CommonModule,FormsModule,RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  user: string = '';
  password: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  login() {
    this.authService.login(this.user, this.password).subscribe(
      response => {
        if (response.success) {
          // Redirige al admin a la ruta de /admin
          this.router.navigate(['/products']);
        } else {
          // Manejo de error
          alert('Error en las credenciales');
        }
      },
      error => {
        // Manejo de errores
        console.error('Error en la solicitud:', error);
      }
    );
  }
}