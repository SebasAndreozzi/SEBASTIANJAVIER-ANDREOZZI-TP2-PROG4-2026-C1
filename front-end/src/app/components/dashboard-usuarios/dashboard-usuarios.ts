import { Component, inject, signal, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Header } from '../header/header';
import { UsersService } from '../../services/users.service';
import { AuthService } from '../../services/auth.service';
import { User } from '../../interfaces/user';
import { passwordStrengthValidator, passwordMatchValidator, futureDateValidator, hasLetterOrNumberValidator } from '../../services/validators';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-dashboard-usuarios',
  imports: [Header, ReactiveFormsModule, RouterLink],
  templateUrl: './dashboard-usuarios.html',
  styleUrl: './dashboard-usuarios.css',
})
export class DashboardUsuarios implements OnInit {
  private fb = inject(FormBuilder);
  private usersService = inject(UsersService);
  protected authService = inject(AuthService);

  users = signal<User[]>([]);
  loading = signal(false);
  showCreateForm = signal(false);
  createLoading = signal(false);

  createForm = this.fb.group({
    nombre: ['', [Validators.required, hasLetterOrNumberValidator]],
    apellido: ['', [Validators.required, hasLetterOrNumberValidator]],
    email: ['', [Validators.required, Validators.email]],
    nombreUsuario: ['', [Validators.required, hasLetterOrNumberValidator]],
    password: ['', [Validators.required, passwordStrengthValidator]],
    confirmPassword: ['', [Validators.required]],
    fechaNacimiento: ['', [Validators.required, futureDateValidator]],
    descripcionBreve: [''],
    perfil: ['usuario', Validators.required],
  }, { validators: passwordMatchValidator });

  get formControls() { return this.createForm.controls; }

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.loading.set(true);
    this.usersService.findAll().subscribe({
      next: (data) => {
        this.users.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        Swal.fire({ icon: 'error', title: 'Error', text: 'Error al cargar usuarios', background: '#1a0a2e', color: '#f0e6d3' });
      },
    });
  }

  toggleCreateForm() {
    this.showCreateForm.update((v) => !v);
    if (!this.showCreateForm()) {
      this.createForm.reset({ perfil: 'usuario' });
    }
  }

  onSubmit() {
    if (this.createForm.invalid) return;
    this.createLoading.set(true);
    const vals = this.createForm.value;
    this.usersService.create({
      nombre: vals.nombre,
      apellido: vals.apellido,
      email: vals.email,
      nombreUsuario: vals.nombreUsuario,
      password: vals.password,
      fechaNacimiento: vals.fechaNacimiento,
      descripcionBreve: vals.descripcionBreve || '',
      perfil: vals.perfil || 'usuario',
    }).subscribe({
      next: () => {
        this.createLoading.set(false);
        this.showCreateForm.set(false);
        this.createForm.reset({ perfil: 'usuario' });
        this.loadUsers();
        Swal.fire({ icon: 'success', title: 'Creado', text: 'Usuario creado exitosamente', background: '#1a0a2e', color: '#f0e6d3', timer: 2000, showConfirmButton: false });
      },
      error: (err) => {
        this.createLoading.set(false);
        Swal.fire({ icon: 'error', title: 'Error', text: err.error?.message || 'Error al crear usuario', background: '#1a0a2e', color: '#f0e6d3' });
      },
    });
  }

  onDisable(userId: string) {
    Swal.fire({
      title: '¿Deshabilitar usuario?',
      text: 'No podrá iniciar sesión hasta ser rehabilitado.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Deshabilitar',
      cancelButtonText: 'Cancelar',
      background: '#1a0a2e',
      color: '#f0e6d3',
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        this.usersService.disable(userId).subscribe({
          next: () => {
            this.loadUsers();
            Swal.fire({ icon: 'success', title: 'Deshabilitado', background: '#1a0a2e', color: '#f0e6d3', timer: 1500, showConfirmButton: false });
          },
          error: () => {
            Swal.fire({ icon: 'error', title: 'Error', background: '#1a0a2e', color: '#f0e6d3' });
          },
        });
      }
    });
  }

  onEnable(userId: string) {
    this.usersService.enable(userId).subscribe({
      next: () => {
        this.loadUsers();
        Swal.fire({ icon: 'success', title: 'Habilitado', background: '#1a0a2e', color: '#f0e6d3', timer: 1500, showConfirmButton: false });
      },
      error: () => {
        Swal.fire({ icon: 'error', title: 'Error', background: '#1a0a2e', color: '#f0e6d3' });
      },
    });
  }
}
