import { Component } from '@angular/core';
import { MemberfooterComponent } from "../../../../../../partials/memberfooter/memberfooter.component";
import { MemberheaderComponent } from "../../../../../../partials/memberheader/memberheader.component";
import { MembersidebarComponent } from "../../../../../../partials/membersidebar/membersidebar.component";

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [MemberfooterComponent, MemberheaderComponent, MembersidebarComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {

}
