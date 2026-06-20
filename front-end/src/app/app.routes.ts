import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { Login } from './components/login/login'
import { Registro } from './components/registro/registro'
import { Publicaciones } from './components/publicaciones/publicaciones';
import { PerfilUsuario } from './components/perfil-usuario/perfil-usuario';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component:Login, },
  { path: 'signup', component:Registro},
  { path: 'publicaciones', component:Publicaciones },
  { path: 'perfil',component:PerfilUsuario}, 
  { path: '**', redirectTo: 'login' },
];
