import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class PresenceGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private activeUsers = new Map<string, any>();

  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    const deviceType = (client.handshake.query.deviceType as string) || 'desktop';
    const name = (client.handshake.query.name as string) || 'Teammate';
    const color = (client.handshake.query.color as string) || '#3b82f6';

    if (userId) {
      this.activeUsers.set(client.id, { 
        userId, 
        name, 
        color, 
        deviceType, 
        lastSeen: new Date(),
        status: 'idle'
      });
      this.broadcastPresence();
    }
  }

  handleDisconnect(client: Socket) {
    this.activeUsers.delete(client.id);
    this.broadcastPresence();
  }

  @SubscribeMessage('presence-update')
  handlePresenceUpdate(client: Socket, payload: any) {
    const user = this.activeUsers.get(client.id);
    if (user) {
      user.status = payload.status;
      user.manuscriptId = payload.manuscriptId;
      this.broadcastPresence();
    }
  }

  private broadcastPresence() {
    const users = Array.from(this.activeUsers.values());
    this.server.emit('presence-cloud', users);
  }
}
