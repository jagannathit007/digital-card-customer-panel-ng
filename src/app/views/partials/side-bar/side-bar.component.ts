import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { SideBarService } from './side-bar.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-side-bar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.scss'],
})
export class SideBarComponent {
  constructor(private router: Router, public sideBarService: SideBarService) {}
}
