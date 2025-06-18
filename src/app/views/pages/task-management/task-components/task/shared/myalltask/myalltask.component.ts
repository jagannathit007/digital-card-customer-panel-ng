import { Component } from '@angular/core';

@Component({
  selector: 'app-myalltask',
  templateUrl: './myalltask.component.html',
  styleUrl: './myalltask.component.scss',
})
export class MyalltaskComponent {
  onMemberSelected(memberData: any): void {
    console.log('Member selected:', memberData);
  }
}
