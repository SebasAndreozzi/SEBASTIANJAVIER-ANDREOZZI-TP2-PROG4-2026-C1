import { Routes } from '@angular/router';
import { Login } from './components/login/login'
import { Registro } from './components/registro/registro'
import { Publicaciones } from './components/publicaciones/publicaciones';
import { PerfilUsuario } from './components/perfil-usuario/perfil-usuario';
import { DetallePublicacion } from './components/detalle-publicacion/detalle-publicacion';
import { DashboardUsuarios } from './components/dashboard-usuarios/dashboard-usuarios';
import { DashboardEstadisticas } from './components/dashboard-estadisticas/dashboard-estadisticas';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'signup', component: Registro },
  { path: 'publicaciones', component: Publicaciones, canActivate: [authGuard] },
  { path: 'publicaciones/:id', component: DetallePublicacion, canActivate: [authGuard] },
  { path: 'perfil', component: PerfilUsuario, canActivate: [authGuard] },
  { path: 'dashboard/usuarios', component: DashboardUsuarios, canActivate: [authGuard, adminGuard] },
  { path: 'dashboard/estadisticas', component: DashboardEstadisticas, canActivate: [authGuard, adminGuard] },
  { path: '**', redirectTo: 'login' },
];
