import { AbstractControl, ValidationErrors } from '@angular/forms';

export function passwordStrengthValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value || '';
  const hasUpperCase = /[A-Z]/.test(value);
  const hasNumber = /[0-9]/.test(value);
  const hasMinLength = value.length >= 8;
  const valid = hasUpperCase && hasNumber && hasMinLength;
  return valid ? null : { weakPassword: true };
}

export function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');
  if (password && confirmPassword && password.value !== confirmPassword.value) {
    return { passwordMismatch: true };
  }
  return null;
}

export function futureDateValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value) return null;
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  const selected = new Date(control.value + 'T12:00:00');
  if (selected > today) {
    return { futureDate: true };
  }
  return null;
}

export function hasLetterOrNumberValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value || '';
  const hasLetterOrNumber = /[a-zA-Z0-9]/.test(value);
  return hasLetterOrNumber ? null : { noLetterOrNumber: true };
}