import { Component, Input, OnInit } from '@angular/core';
import { TooltipPosition, TooltipTheme } from './tooltip.enums';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-tooltip',
  standalone: true,
  templateUrl: './tooltip.component.html',
  styleUrls: ['./tooltip.component.scss'],
  imports:[
    CommonModule,
    FormsModule,]
})
export class TooltipComponent implements OnInit {
  @Input() text: any;

  position: TooltipPosition = TooltipPosition.DEFAULT;
  theme: TooltipTheme = TooltipTheme.DEFAULT;
  tooltip = '';
  left = 0;
  top = 0;
  visible = false;

  constructor() {}

  ngOnInit(): void {}
}
