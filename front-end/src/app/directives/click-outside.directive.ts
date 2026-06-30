import { Directive, output, ElementRef } from '@angular/core';

@Directive({
  selector: '[clickOutside]',
  host: {
    '(document:click)': 'onDocumentClick($event)',
  },
})
export class ClickOutsideDirective {
  clickOutside = output<void>();

  constructor(private el: ElementRef) {}

  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (target && !this.el.nativeElement.contains(target)) {
      this.clickOutside.emit();
    }
  }
}
