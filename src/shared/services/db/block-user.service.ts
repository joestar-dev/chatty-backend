import { UserModel } from '@user/model/user.schema';
import { PushOperator, BulkWriteResult } from 'mongodb';
import mongoose from 'mongoose';

class BlockUserService {
  public async blockUser(userId: string, followerId: string): Promise<void> {
    // const user = userId as unknown as string;
    // const follower = followerId as unknown as string;
    UserModel.bulkWrite([
      {
        updateOne: {
          filter: { _id: new mongoose.Types.ObjectId(userId), blocked: { $ne: new mongoose.Types.ObjectId(followerId) } },
          update: {
            $push: {
              blocked: new mongoose.Types.ObjectId(followerId)
            } as PushOperator<Document>
           },
        }
      },
      {
        updateOne: {
          filter: { _id: new mongoose.Types.ObjectId(followerId), blockedBy: { $ne: new mongoose.Types.ObjectId(userId) } },
          update: {
            $push: {
              blockedBy: new mongoose.Types.ObjectId(userId)
            } as PushOperator<Document>
           },
        },
      }
    ]);
  }
  public async unblockUser(userId: string, followerId: string): Promise<void> {
    UserModel.bulkWrite([
      {
        updateOne: {
          filter: { _id: userId },
          update: {
            $pull: {
              blocked: new mongoose.Types.ObjectId(followerId)
            } as PushOperator<Document>
           },
        }
      },
      {
        updateOne: {
          filter: { _id: followerId },
          update: {
            $pull: {
              blockedBy: new mongoose.Types.ObjectId(userId)
            } as PushOperator<Document>
           },
        },
      }
    ]);
  }
}

export const blockUserService: BlockUserService = new BlockUserService();
