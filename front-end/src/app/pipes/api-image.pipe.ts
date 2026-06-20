import { Pipe, PipeTransform } from '@angular/core';

const API_BASE = 'http://localhost:3000';

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
