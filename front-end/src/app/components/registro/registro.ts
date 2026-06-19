import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-registro',
  imports: [ReactiveFormsModule],
  templateUrl: './registro.html',
  styleUrl: './registro.css',
})
export class Registro {

  private fb = inject(FormBuilder);
  private router = inject(Router);

  signupForm = this.fb.group({
    name: ['',[Validators.required]],
    surname: ['', [Validators.required]],
    age: ['', [Validators.required]],
    email: ['',[Validators.required,Validators.email]],
    clave: ['', [Validators.required, Validators.minLength(6)]]
  });

  enviarDatos()
  {
    if(this.signupForm.valid){
      console.log('Datos del form:', this.signupForm.value);
      this.router.navigate(['/chat']);
    }else{
      this.signupForm.markAllAsTouched();
    }
  }
}
