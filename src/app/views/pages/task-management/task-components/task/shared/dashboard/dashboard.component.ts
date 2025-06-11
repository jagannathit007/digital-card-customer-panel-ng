import { Component } from '@angular/core';
import { MemberfooterComponent } from "../../../../../../partials/memberfooter/memberfooter.component";
import { CustomdataComponent } from "../../../../../../partials/task-managemnt/common-components/customdata/customdata.component";

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [MemberfooterComponent, CustomdataComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {

}
