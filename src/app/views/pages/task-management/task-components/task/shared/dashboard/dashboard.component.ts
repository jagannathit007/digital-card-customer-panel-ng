import { Component } from '@angular/core';
import { MemberfooterComponent } from "../../../../../../partials/memberfooter/memberfooter.component";

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [MemberfooterComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {

}
