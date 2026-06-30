import { Routes } from '@angular/router';
import { RenderMode } from '@angular/ssr';
import { Login } from './components/login/login'
import { Registro } from './components/registro/registro'
import { Publicaciones } from './components/publicaciones/publicaciones';
import { PerfilUsuario } from './components/perfil-usuario/perfil-usuario';
import { DetallePublicacion } from './components/detalle-publicacion/detalle-publicacion';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'signup', component: Registro },
  { path: 'publicaciones', component: Publicaciones, canActivate: [authGuard] },
  { path: 'publicaciones/:id', component: DetallePublicacion, canActivate: [authGuard], renderMode: RenderMode.Client },
  { path: 'perfil', component: PerfilUsuario, canActivate: [authGuard] },
  { path: '**', redirectTo: 'login' },
];
