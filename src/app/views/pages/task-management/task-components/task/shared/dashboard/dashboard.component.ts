import { Component } from '@angular/core';
import { MemberfooterComponent } from "../../../../../../partials/memberfooter/memberfooter.component";
import { CustomdataComponent } from "../../../../../../partials/task-managemnt/common-components/customdata/customdata.component";
import { AiassistantComponent } from 'src/app/views/partials/task-managemnt/common-components/aiassistant/aiassistant.component';
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [MemberfooterComponent, CustomdataComponent,AiassistantComponent ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {

}
