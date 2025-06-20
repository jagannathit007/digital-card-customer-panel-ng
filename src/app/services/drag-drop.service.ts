// drag-drop.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface DragState {
  isDragging: boolean;
  draggedItem: any;
  sourceContainer: string;
  targetContainer?: string;
  dragType: 'task' | 'column' | null;
}

@Injectable({
  providedIn: 'root'
})
export class DragDropService {
  private dragStateSubject = new BehaviorSubject<DragState>({
    isDragging: false,
    draggedItem: null,
    sourceContainer: '',
    targetContainer: undefined,
    dragType: null
  });

  public dragState$: Observable<DragState> = this.dragStateSubject.asObservable();

  startDrag(item: any, sourceContainer: string, dragType: 'task' | 'column' = 'task') {
    this.dragStateSubject.next({
      isDragging: true,
      draggedItem: item,
      sourceContainer,
      targetContainer: undefined,
      dragType
    });

    // Add global class to body to help with styling
    document.body.classList.add('cdk-drop-list-dragging');
    if (dragType === 'task') {
      document.body.classList.add('dragging-task');
    } else {
      document.body.classList.add('dragging-column');
    }
  }

  updateTarget(targetContainer: string) {
    const currentState = this.dragStateSubject.value;
    if (currentState.isDragging) {
      this.dragStateSubject.next({
        ...currentState,
        targetContainer
      });
    }
  }

  endDrag() {
    this.dragStateSubject.next({
      isDragging: false,
      draggedItem: null,
      sourceContainer: '',
      targetContainer: undefined,
      dragType: null
    });

    // Remove global classes
    document.body.classList.remove('cdk-drop-list-dragging', 'dragging-task', 'dragging-column');
  }

  getCurrentState(): DragState {
    return this.dragStateSubject.value;
  }

  isDragging(): boolean {
    return this.dragStateSubject.value.isDragging;
  }

  isDraggingTask(): boolean {
    const state = this.dragStateSubject.value;
    return state.isDragging && state.dragType === 'task';
  }

  isDraggingColumn(): boolean {
    const state = this.dragStateSubject.value;
    return state.isDragging && state.dragType === 'column';
  }

  // Cancel drag operation (useful for escape key)
  cancelDrag() {
    if (this.isDragging()) {
      this.endDrag();
      // Additional cleanup if needed
      const dragPreview = document.querySelector('.cdk-drag-preview');
      if (dragPreview) {
        dragPreview.remove();
      }
    }
  }
}