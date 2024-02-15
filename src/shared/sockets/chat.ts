import { ISenderReceiver } from '@chat/interfaces/chat.interface';
import { Socket, Server } from 'socket.io';
import { connectedUsersToMap } from './user';

export let socketIOChatObject: Server;

export class SocketIOChatHandler {
  private io: Server;
  constructor(io: Server) {
    this.io = io;
    socketIOChatObject = io;
  }

  public listen(): void {
    this.io.on('connection', (socket: Socket) => {
      socket.on('join room', (users: ISenderReceiver) => {
        const { senderName, receiverName } = users;
        const senderSocketId: string = connectedUsersToMap.get(senderName) as string;
        const receiverSocketId: string = connectedUsersToMap.get(receiverName) as string;
        socket.join(senderSocketId);
        socket.join(receiverSocketId);
      });
    })
  }
}
