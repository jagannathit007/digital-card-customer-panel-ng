import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TaskRoutingModule } from './task-routing.module';


import { RouterModule } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { TooltipDirective } from '../../partials/tooltip/tooltip.directive';
import { ToggleComponent } from '../../partials/toggle/toggle.component';
import { DebounceDirective } from 'src/app/core/directives/debounce';

@NgModule({
  declarations: [

  ],
  imports: [
    CommonModule,
   TaskRoutingModule,
    RouterModule,
    NgxPaginationModule,
    NgSelectModule,
    FormsModule,
    TooltipDirective,
    ToggleComponent,
    DebounceDirective,
  ]
})
export class TaskModule { }
