import { Directive, ElementRef, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Directive({
  selector: '[appearAnimation]',
  host: {
    '(window:scroll)': 'checkVisibility()',
    '(window:resize)': 'checkVisibility()',
  },
})
export class AppearAnimationDirective {
  private observed = false;

  constructor(
    private el: ElementRef,
    @Inject(PLATFORM_ID) private platformId: object,
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.el.nativeElement.style.opacity = '0';
      this.el.nativeElement.style.transform = 'translateY(20px)';
      this.el.nativeElement.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      this.checkVisibility();
    }
  }

  checkVisibility() {
    if (!isPlatformBrowser(this.platformId) || this.observed) return;
    const rect = this.el.nativeElement.getBoundingClientRect();
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;
    if (rect.top < windowHeight - 100) {
      this.el.nativeElement.style.opacity = '1';
      this.el.nativeElement.style.transform = 'translateY(0)';
      this.observed = true;
    }
  }
}
