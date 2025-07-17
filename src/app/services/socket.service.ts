import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';
import { environment } from 'src/env/env.local';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: Socket;
  private readonly SERVER_URL = environment.baseURL; // Update to your backend URL

  constructor() {
    this.socket = io(this.SERVER_URL, {
    //   transports: ['websocket'], // Optional: enforce websocket
    });
  }

  // Authenticate (optional)
  authenticate(userId: string): void {
    this.socket.emit('authenticate', { userId });
  }

  // Join room
  joinRoom(room: string = 'team_task'): void {
    this.socket.emit('join_room', room);
    console.log('Joined room:', room);
  }

  // Leave room
  leaveRoom(room: string = 'team_task'): void {
    this.socket.emit('leave_room', room);
    console.log('Left room:', room);
  }

  // Send message to room (simulate task update)
  sendTaskUpdate(room: string, taskId: string, boardId: string, updates: any): void {
    console.log('Sending task update:', { taskId, boardId, updates });
    this.socket.emit('task_update', room, { taskId, boardId, updates });
  }

  // Listen to task_updated event
  onTaskUpdated(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('task_updated', (data) => {
        observer.next(data);
      });
    });
  }

  // send task details update
  sendTaskDetailsUpdate(room: string, taskId: string, boardId: string, type: string, updates: any): void {
    this.socket.emit('task_details_update', room, { taskId, boardId, type, updates });
  }

  // on task details update
  onTaskDetailsUpdate(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('task_details_update', (data) => {
        observer.next(data);
      });
    });
  }

  // comment update
  sendCommentUpdate(room: string, taskId: string, boardId: string, type: string, updates: any): void {
    console.log('Sending comment update:', { taskId, boardId, type, updates });
    this.socket.emit('comment_update', room, { taskId, boardId, type, updates });
  }

  // Listen to comment_updated event
  onCommentUpdated(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('comment_update', (data) => {
        observer.next(data);
      });
    });
  }

  // send board public attchments and comments updates
  sendBoardUpdate(room: string, boardId: string, type: string, updates: any): void {
    this.socket.emit('board_update', room, { boardId, type, updates });
  }

  // on board update
  onBoardUpdate(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('board_update', (data) => {
        observer.next(data);
      });
    });
  }

  // send task creation
  sendTaskCreated(room: string, taskId: string, boardId: string, updates: any): void {
    this.socket.emit('task_created', room, { taskId, boardId, updates });
  }

  // task created
  onTaskCreated(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('task_created', (data) => {
        observer.next(data);
      });
    });
  }

  // send board member updated event
  sendBoardMemberUpdate(room: string, boardId: string, type: string, updates: any): void {
    this.socket.emit('board_member_update', room, { boardId, type, updates });
  }

  // on board member update
  onBoardMembersUpdate(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('board_member_update', (data) => {
        observer.next(data);
      });
    });
  }

  // send all boards updates
  sendAllBoardsUpdate(room: string, type: string, updates: any): void {
    this.socket.emit('all_boards_update', room, { type, updates });
  }

  // on all boards update
  onAllBoardsUpdate(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('all_boards_update', (data) => {
        observer.next(data);
      });
    });
  }
}
