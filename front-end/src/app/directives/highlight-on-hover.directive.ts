import { Directive, ElementRef } from '@angular/core';

@Directive({
  selector: '[highlightOnHover]',
  host: {
    '(mouseenter)': 'onMouseEnter()',
    '(mouseleave)': 'onMouseLeave()',
  },
})
export class HighlightOnHoverDirective {
  private originalBorder: string = '';

  constructor(private el: ElementRef) {
    this.originalBorder = this.el.nativeElement.style.border || '';
  }

  onMouseEnter() {
    this.el.nativeElement.style.border = '2px solid #ffd700';
    this.el.nativeElement.style.transition = 'border 0.2s ease';
  }

  onMouseLeave() {
    this.el.nativeElement.style.border = this.originalBorder;
  }
}
