import { Component, inject, signal, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Header } from '../header/header';
import { EstadisticasService } from '../../services/estadisticas.service';
import { PostsPorUsuario, ComentariosEnPeriodo, ComentariosPorPublicacion } from '../../interfaces/estadistica';
import { TruncatePipe } from '../../pipes/truncate.pipe';
import { CapitalizePipe } from '../../pipes/capitalize.pipe';

@Component({
  selector: 'app-dashboard-estadisticas',
  imports: [Header, FormsModule, RouterLink, TruncatePipe, CapitalizePipe],
  templateUrl: './dashboard-estadisticas.html',
  styleUrl: './dashboard-estadisticas.css',
})
export class DashboardEstadisticas implements OnInit {
  private statsService = inject(EstadisticasService);
  private sanitizer = inject(DomSanitizer);

  desde = signal('');
  hasta = signal('');
  loading = signal(false);

  postsPorUsuario = signal<PostsPorUsuario[]>([]);
  comentariosEnPeriodo = signal<ComentariosEnPeriodo[]>([]);
  comentariosPorPublicacion = signal<ComentariosPorPublicacion[]>([]);

  ngOnInit() {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    this.desde.set(oneMonthAgo.toISOString().slice(0, 10));
    this.loadAll();
  }

  private requestGen = 0;

  loadAll() {
    this.requestGen++;
    const gen = this.requestGen;
    this.loading.set(true);
    this.postsPorUsuario.set([]);
    this.comentariosEnPeriodo.set([]);
    this.comentariosPorPublicacion.set([]);
    this.loadedCount = 0;
    const desde = this.desde() || undefined;
    const hasta = this.hasta() || undefined;

    this.statsService.getPostsPorUsuario(desde, hasta).subscribe({
      next: (data) => { if (this.requestGen !== gen) return; this.postsPorUsuario.set(data); this.checkLoadComplete(); },
      error: (err) => { if (this.requestGen !== gen) return; console.error('Error posts-por-usuario:', err); this.postsPorUsuario.set([]); this.checkLoadComplete(); },
    });

    this.statsService.getComentariosEnPeriodo(desde, hasta).subscribe({
      next: (data) => { if (this.requestGen !== gen) return; this.comentariosEnPeriodo.set(data); this.checkLoadComplete(); },
      error: (err) => { if (this.requestGen !== gen) return; console.error('Error comentarios-en-periodo:', err); this.comentariosEnPeriodo.set([]); this.checkLoadComplete(); },
    });

    this.statsService.getComentariosPorPublicacion(desde, hasta).subscribe({
      next: (data) => { if (this.requestGen !== gen) return; this.comentariosPorPublicacion.set(data); this.checkLoadComplete(); },
      error: (err) => { if (this.requestGen !== gen) return; console.error('Error comentarios-por-publicacion:', err); this.comentariosPorPublicacion.set([]); this.checkLoadComplete(); },
    });
  }

  private loadedCount = 0;
  private checkLoadComplete() {
    this.loadedCount++;
    if (this.loadedCount >= 3) {
      this.loading.set(false);
      this.loadedCount = 0;
    }
  }

  postPercentages(): { usuario: string; porcentaje: string }[] {
    const data = this.postsPorUsuario();
    const total = data.reduce((sum, d) => sum + d.cantidad, 0) || 1;
    return data.map(d => ({
      usuario: d.usuario,
      porcentaje: ((d.cantidad / total) * 100).toFixed(1),
    }));
  }

  pieChartData(): { labels: string[]; values: number[]; colors: string[] } {
    const data = this.postsPorUsuario();
    const colors = ['#ffd700', '#b8860b', '#ff6b6b', '#48c774', '#4a9eff', '#a855f7', '#f97316', '#06b6d4'];
    return {
      labels: data.map(d => d.usuario),
      values: data.map(d => d.cantidad),
      colors: colors.slice(0, data.length),
    };
  }

  barChartData(): { labels: string[]; values: number[]; colors: string[] } {
    const data = this.comentariosEnPeriodo();
    const palette = ['#4a9eff', '#ff6b6b', '#48c774', '#ffd700', '#a855f7', '#f97316', '#06b6d4', '#b8860b'];
    return {
      labels: data.map(d => d.usuario),
      values: data.map(d => d.cantidad),
      colors: palette.slice(0, data.length),
    };
  }

  lineChartData(): { labels: string[]; values: number[] } {
    const data = this.comentariosPorPublicacion();
    return {
      labels: data.map(d => d.titulo.length > 20 ? d.titulo.substring(0, 20) + '...' : d.titulo),
      values: data.map(d => d.cantidadComentarios),
    };
  }

  safePieSvg(): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(this.pieSvgPath());
  }

  safeBarSvg(): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(this.barSvgPath());
  }

  safeLineSvg(): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(this.lineSvgPath());
  }

  lineLabelPositions(): { left: string }[] {
    const { labels } = this.lineChartData();
    const count = labels.length;
    if (count < 2) return [];
    const span = 380;
    const pad = 10;
    return labels.map((_, i) => ({
      left: ((pad + i * (span / (count - 1))) / 400) * 100 + '%',
    }));
  }

  pieSvgPath(): string {
    const { values, colors } = this.pieChartData();
    const total = values.reduce((a, b) => a + b, 0) || 1;
    const cx = 120, cy = 120, r = 100;
    let currentAngle = 0;
    const slices: string[] = [];

    values.forEach((val, i) => {
      const angle = (val / total) * 360;
      const startAngle = currentAngle;
      const endAngle = currentAngle + angle;
      const startRad = (startAngle - 90) * Math.PI / 180;
      const endRad = (endAngle - 90) * Math.PI / 180;
      const x1 = cx + r * Math.cos(startRad);
      const y1 = cy + r * Math.sin(startRad);
      const x2 = cx + r * Math.cos(endRad);
      const y2 = cy + r * Math.sin(endRad);
      const largeArc = angle > 180 ? 1 : 0;
      const path = `M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${largeArc},1 ${x2},${y2} Z`;
      slices.push(`<path d="${path}" fill="${colors[i]}" stroke="#0a0a1a" stroke-width="2"/>`);
      currentAngle += angle;
    });

    return slices.join('');
  }

  barSvgPath(): string {
    const { labels, values, colors } = this.barChartData();
    const maxVal = Math.max(...values, 1);
    const w = 360;
    const h = 160;
    const barCount = labels.length;
    if (barCount === 0) return '';
    const barWidth = (w / barCount) - 4;
    const parts: string[] = [];
    parts.push(`<line x1="20" y1="180" x2="380" y2="180" stroke="#555" stroke-width="1"/>`);

    values.forEach((val, i) => {
      const barH = (val / maxVal) * h;
      const x = 20 + (i * (w / barCount));
      const y = 180 - barH;
      parts.push(`<rect x="${x}" y="${y}" width="${barWidth}" height="${barH}" fill="${colors[i]}" rx="3"/>`);
    });

    return parts.join('');
  }

  lineSvgPath(): string {
    const { labels, values } = this.lineChartData();
    const maxVal = Math.max(...values, 1);
    const count = labels.length;
    if (count < 2) return '';

    const span = 380;
    const pad = 10;
    const parts: string[] = [];
    parts.push(`<line x1="${pad}" y1="180" x2="${pad + span}" y2="180" stroke="#555" stroke-width="1"/>`);

    for (let i = 0; i < count; i++) {
      const x = pad + (i * (span / (count - 1)));
      const y = 180 - (values[i] / maxVal) * 150;
      parts.push(`<circle cx="${x}" cy="${y}" r="4" fill="#ffd700"/>`);

      if (i < count - 1) {
        const x2 = pad + ((i + 1) * (span / (count - 1)));
        const y2 = 180 - (values[i + 1] / maxVal) * 150;
        parts.push(`<line x1="${x}" y1="${y}" x2="${x2}" y2="${y2}" stroke="#ffd700" stroke-width="2"/>`);
      }
    }

    return parts.join('');
  }
}
