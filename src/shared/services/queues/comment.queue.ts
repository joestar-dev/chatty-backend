import { BaseQueue } from './base.queue';
import { commentWorker } from '@worker/comment.worker';
import { ICommentJob } from '@comment/interfaces/comment.interface';

class CommentsQueue extends BaseQueue {
  constructor() {
    super('comments');

    this.processJob('addCommentToDB', 5, commentWorker.addCommentToDB);
  }

  public addCommentJob(name: string, data: ICommentJob): void {
    this.addJob(name, data);
  }
}

export const commentQueue: CommentsQueue = new CommentsQueue;
