import { Component, inject, signal, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Header } from '../header/header';
import { AuthService } from '../../services/auth.service';
import { UsersService } from '../../services/users.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ApiImagePipe } from '../../pipes/api-image.pipe';

@Component({
  selector: 'app-perfil-usuario',
  imports: [ReactiveFormsModule, Header, ApiImagePipe],
  templateUrl: './perfil-usuario.html',
  styleUrl: './perfil-usuario.css',
})
export class PerfilUsuario implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private usersService = inject(UsersService);

  editing = signal(false);
  loading = signal(false);
  successMessage = signal('');
  errorMessage = signal('');

  currentUser = this.authService.currentUser;

  profileForm = this.fb.group({
    nombre: ['', [Validators.required]],
    apellido: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    nombreUsuario: ['', [Validators.required]],
    descripcionBreve: [''],
  });

  ngOnInit() {
    const user = this.currentUser();
    if (user) {
      this.profileForm.patchValue({
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email,
        nombreUsuario: user.nombreUsuario,
        descripcionBreve: user.descripcionBreve,
      });
    }
  }

  toggleEdit() {
    this.editing.update((v) => !v);
    if (!this.editing()) {
      const user = this.currentUser();
      if (user) {
        this.profileForm.patchValue({
          nombre: user.nombre,
          apellido: user.apellido,
          email: user.email,
          nombreUsuario: user.nombreUsuario,
          descripcionBreve: user.descripcionBreve,
        });
      }
    }
  }

  onSubmit() {
    if (this.profileForm.invalid) return;

    this.loading.set(true);
    this.successMessage.set('');
    this.errorMessage.set('');

    const user = this.currentUser();
    if (!user) return;

    this.usersService.update(user._id, this.profileForm.value as any).subscribe({
      next: (updatedUser) => {
        this.loading.set(false);
        this.successMessage.set('Perfil actualizado correctamente');
        this.editing.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        this.errorMessage.set(err.error?.message || 'Error al actualizar perfil');
      },
    });
  }
}
