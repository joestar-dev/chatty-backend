import { Request, Response } from 'express';
import mongoose from 'mongoose';
import HTTP_STATUS  from 'http-status-codes';
import { IMessageData } from '@chat/interfaces/chat.interface';
import { MessageCache } from '@service/redis/message.cache';
import { chatService } from '@service/db/chat.service';

const messageCache: MessageCache = new MessageCache();

export class Get {
  public async conversationList(req: Request, res: Response): Promise<void> {
    let list: IMessageData[] = [];
    const cacheList: IMessageData[] = await messageCache.getUserConversationList(`${req.currentUser!.userId}`);
    if (cacheList.length) {
      list = cacheList;
    } else {
      list = await chatService.getUserConversationList(new mongoose.Types.ObjectId(req.currentUser!.userId));
    }
    res.status(HTTP_STATUS.OK).json({ message: `User conversation list.`, list });
  }

  public async messages(req: Request, res: Response): Promise<void> {
    const { receiverId } = req.params;
    let messages: IMessageData[] = [];
    const cacheMessages: IMessageData[] = await messageCache.getChatMessagesFromCache(`${req.currentUser!.userId}`, `${receiverId}`);
    if (cacheMessages.length) {
      messages = cacheMessages;
    } else {
      messages = await chatService.getMessages(
        new mongoose.Types.ObjectId(req.currentUser!.userId),
        new mongoose.Types.ObjectId(receiverId),
        { createdAt: 1 }
      );
    }
    res.status(HTTP_STATUS.OK).json({ message: `User chat messages.`, messages });
  }
}

