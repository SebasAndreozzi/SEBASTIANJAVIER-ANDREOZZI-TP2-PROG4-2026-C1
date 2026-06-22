import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';

function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');
  if (password && confirmPassword && password.value !== confirmPassword.value) {
    return { passwordMismatch: true };
  }
  return null;
}

function futureDateValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value) return null;
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  const selected = new Date(control.value + 'T12:00:00');
  if (selected > today) {
    return { futureDate: true };
  }
  return null;
}

function passwordStrengthValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value || '';
  const hasUpperCase = /[A-Z]/.test(value);
  const hasNumber = /[0-9]/.test(value);
  const hasMinLength = value.length >= 8;
  const valid = hasUpperCase && hasNumber && hasMinLength;
  return valid ? null : { weakPassword: true };
}

@Component({
  selector: 'app-registro',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './registro.html',
  styleUrl: './registro.css',
})
export class Registro {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);

  errorMessage = signal('');
  loading = signal(false);
  selectedFile = signal<File | null>(null);
  previewUrl = signal<string | null>(null);

  signupForm = this.fb.group(
    {
      nombre: ['', [Validators.required]],
      apellido: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      nombreUsuario: ['', [Validators.required]],
      password: ['', [Validators.required, passwordStrengthValidator]],
      confirmPassword: ['', [Validators.required]],
      fechaNacimiento: ['', [Validators.required, futureDateValidator]],
      descripcionBreve: [''],
      perfil: ['usuario', [Validators.required]],
    },
    { validators: passwordMatchValidator },
  );

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.selectedFile.set(file);

      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl.set(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit() {
    if (this.signupForm.invalid) {
      this.signupForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    const formData = new FormData();
    const formValue = this.signupForm.value;

    formData.append('nombre', formValue.nombre!);
    formData.append('apellido', formValue.apellido!);
    formData.append('email', formValue.email!);
    formData.append('nombreUsuario', formValue.nombreUsuario!);
    formData.append('password', formValue.password!);
    formData.append('fechaNacimiento', formValue.fechaNacimiento!);
    formData.append('descripcionBreve', formValue.descripcionBreve || '');
    formData.append('perfil', formValue.perfil || 'usuario');

    const file = this.selectedFile();
    if (file) {
      formData.append('imagenPerfil', file);
    }

    this.authService.register(formData).subscribe({
      next: () => {
        this.router.navigate(['/publicaciones']);
      },
      error: (err: HttpErrorResponse) => {
        this.errorMessage.set(err.error?.message || 'Error al registrarse');
        this.loading.set(false);
      },
    });
  }
}
