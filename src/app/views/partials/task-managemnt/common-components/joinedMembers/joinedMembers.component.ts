import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-joined-members',
  standalone: true,
  imports: [],
  templateUrl: './joinedMembers.component.html',
  styleUrl: './joinedMembers.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JoinedMembersComponent { }
