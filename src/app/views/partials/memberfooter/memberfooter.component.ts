import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-memberfooter',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './memberfooter.component.html',
  styleUrl: './memberfooter.component.scss'
})
export class MemberfooterComponent {
  
  // Current year for copyright
  currentYear: number = new Date().getFullYear();
  
  // Company name - you can change this
  companyName: string = 'IT FUTURZ';
}