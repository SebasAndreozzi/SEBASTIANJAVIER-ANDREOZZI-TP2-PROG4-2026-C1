import { Pipe, PipeTransform } from '@angular/core';
import { environment } from '../environments/environment';

const API_BASE = environment.apiUrl;

@Pipe({
  name: 'apiImage',
})
export class ApiImagePipe implements PipeTransform {
  transform(value: string | undefined | null): string {
    if (!value) return '';
    if (value.startsWith('/uploads/')) {
      return `${API_BASE}${value}`;
    }
    return value;
  }
}
