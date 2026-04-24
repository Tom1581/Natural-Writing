import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
export declare class PresenceGateway implements OnGatewayConnection, OnGatewayDisconnect {
    server: Server;
    private activeUsers;
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    handlePresenceUpdate(client: Socket, payload: any): void;
    private broadcastPresence;
}
