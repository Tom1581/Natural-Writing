"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PresenceGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
let PresenceGateway = class PresenceGateway {
    server;
    activeUsers = new Map();
    handleConnection(client) {
        const userId = client.handshake.query.userId;
        const deviceType = client.handshake.query.deviceType || 'desktop';
        const name = client.handshake.query.name || 'Teammate';
        const color = client.handshake.query.color || '#3b82f6';
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
    handleDisconnect(client) {
        this.activeUsers.delete(client.id);
        this.broadcastPresence();
    }
    handlePresenceUpdate(client, payload) {
        const user = this.activeUsers.get(client.id);
        if (user) {
            user.status = payload.status;
            user.manuscriptId = payload.manuscriptId;
            this.broadcastPresence();
        }
    }
    broadcastPresence() {
        const users = Array.from(this.activeUsers.values());
        this.server.emit('presence-cloud', users);
    }
};
exports.PresenceGateway = PresenceGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], PresenceGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('presence-update'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], PresenceGateway.prototype, "handlePresenceUpdate", null);
exports.PresenceGateway = PresenceGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: '*',
        },
    })
], PresenceGateway);
//# sourceMappingURL=presence.gateway.js.map