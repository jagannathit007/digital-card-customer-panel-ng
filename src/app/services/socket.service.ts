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
}
