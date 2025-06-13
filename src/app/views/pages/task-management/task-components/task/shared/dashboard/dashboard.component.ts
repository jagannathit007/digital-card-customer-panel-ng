import { Component } from '@angular/core';
import { CustomdataComponent } from "../../../../../../partials/task-managemnt/common-components/customdata/customdata.component";
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CustomdataComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {

}
