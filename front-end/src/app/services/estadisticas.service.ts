import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface PostsPorUsuario {
  usuario: string;
  cantidad: number;
}

export interface ComentariosEnPeriodo {
  usuario: string;
  cantidad: number;
}

export interface ComentariosPorPublicacion {
  _id: string;
  titulo: string;
  cantidadComentarios: number;
}

@Injectable({
  providedIn: 'root',
})
export class EstadisticasService {
  private http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl + '/estadisticas';

  getPostsPorUsuario(desde?: string, hasta?: string): Observable<PostsPorUsuario[]> {
    let params = new HttpParams();
    if (desde) params = params.set('desde', desde);
    if (hasta) params = params.set('hasta', hasta);
    return this.http.get<PostsPorUsuario[]>(`${this.apiUrl}/posts-por-usuario`, { params });
  }

  getComentariosEnPeriodo(desde?: string, hasta?: string): Observable<ComentariosEnPeriodo[]> {
    let params = new HttpParams();
    if (desde) params = params.set('desde', desde);
    if (hasta) params = params.set('hasta', hasta);
    return this.http.get<ComentariosEnPeriodo[]>(`${this.apiUrl}/comentarios-en-periodo`, { params });
  }

  getComentariosPorPublicacion(desde?: string, hasta?: string): Observable<ComentariosPorPublicacion[]> {
    let params = new HttpParams();
    if (desde) params = params.set('desde', desde);
    if (hasta) params = params.set('hasta', hasta);
    return this.http.get<ComentariosPorPublicacion[]>(`${this.apiUrl}/comentarios-por-publicacion`, { params });
  }
}
