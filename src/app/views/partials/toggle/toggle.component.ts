import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-toggle',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toggle.component.html',
  styleUrl: './toggle.component.scss'
})
export class ToggleComponent {
  @Input() isActive: boolean = false;
  @Input() showLabel: boolean = true;
  @Input() onText: string = 'On';
  @Input() offText: string = 'Off';
  @Output() changed = new EventEmitter<boolean>();

  toggle() {
    this.isActive = !this.isActive;
    this.changed.emit(this.isActive);
  }
}
