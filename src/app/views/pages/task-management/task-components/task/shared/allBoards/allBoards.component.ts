import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-all-boards',
  standalone: true,
  imports: [],
  templateUrl: './allBoards.component.html',
  styleUrl: './allBoards.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AllBoardsComponent { }
