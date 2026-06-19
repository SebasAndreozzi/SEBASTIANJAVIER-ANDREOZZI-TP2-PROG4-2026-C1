import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private fb = inject(FormBuilder);
  private router = inject(Router);

  loginForm = this.fb.group({
    email: ['',[Validators.required,Validators.email]],
    clave: ['', [Validators.required, Validators.minLength(6)]]
  });

  enviarDatos()
  {
    if(this.loginForm.valid){
      console.log('Datos del form:', this.loginForm.value);
      this.router.navigate(['/chat']);
    }else{
      this.loginForm.markAllAsTouched();
    }
  }
}