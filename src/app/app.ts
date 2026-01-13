import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BusinessComponent } from './business/business';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, BusinessComponent],
  template: `
    <app-business></app-business>
  `
})
export class App {}
