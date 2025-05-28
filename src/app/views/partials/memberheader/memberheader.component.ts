import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-memberheader',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './memberheader.component.html',
  styleUrl: './memberheader.component.scss'
})
export class MemberheaderComponent {
  
  // Simple profile data - you can modify this later
  profileName: string = 'User Name';
  
  // Method to handle profile click
  onProfileClick() {
    console.log('Profile clicked');
    // You can add navigation or dropdown logic here later
  }
}