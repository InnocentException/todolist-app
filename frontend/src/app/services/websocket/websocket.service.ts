import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class WebsocketService {
  private webSocket: WebSocket | null = null;

  constructor() {
    console.log('Creating WebSocket ...');
    this.webSocket = new WebSocket('ws://localhost:3100');

    if (this.webSocket) {
      this.webSocket.onopen = (event: Event) => {
        console.log('Connection established!');
      };
    }
  }

  disconnect() {
    if (this.webSocket) {
      this.webSocket.close();
    }
  }

  send(message: any) {
    if (this.isConnected()) {
      this.webSocket!.send(JSON.stringify(message));
    } else {
      console.error('WebSocket not open or connection not established.');
    }
  }

  isConnected() {
    return this.webSocket && this.webSocket.readyState === WebSocket.OPEN;
  }
}
