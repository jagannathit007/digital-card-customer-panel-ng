import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BoardNotificationService {
  // BehaviorSubject to track current board changes
  private currentBoardSubject = new BehaviorSubject<string>('');
  public currentBoard$ = this.currentBoardSubject.asObservable();

  // Method to update current board
  setCurrentBoard(boardId: string) {
    this.currentBoardSubject.next(boardId);
  }

  // Method to get current board ID
  getCurrentBoardId(): string {
    return this.currentBoardSubject.value;
  }

  // Method to clear current board
  clearCurrentBoard() {
    this.currentBoardSubject.next('');
  }
}