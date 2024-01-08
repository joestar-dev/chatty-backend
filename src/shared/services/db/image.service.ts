import { IFileImageDocument } from '@image/interfaces/image.interface';
import { ImageModel } from '@image/models/images.schema';
import { UserModel } from '@user/model/user.schema';
import mongoose from 'mongoose';

class ImageService {
  public async addUserProfileImageToDB(userId: string, url: string, imgId: string, imgVersion: string): Promise<void> {
    await UserModel.updateOne({ _id: userId }, { $set: { profilePicture: url } }).exec();
    await this.addImage(userId, imgId, imgVersion, 'profile');
  }

  public async addBackgroundImageToDB(userId: string, imgId: string, imgVersion: string): Promise<void> {
    await UserModel.updateOne({ _id: userId }, { $set: { bgImageId: imgId, bgImageVersion: imgVersion } }).exec();
    await this.addImage(userId, imgId, imgVersion, 'background');
  }

  public async addImage(userId: string, imgId: string, imgVersion: string, type: string): Promise<void> {
    await ImageModel.create({
      userId,
      bgImageVersion: type === 'background' ? imgVersion : '',
      bgImageId: type === 'background' ? imgId : '',
      imgId,
      imgVersion
      // imgVersion: type === 'profile' ? imgVersion : '',
      // imgId: type === 'profile' ? imgId : '',
    });
  }

  public async removeImageFromDB(imageId: string): Promise<void> {
    await ImageModel.deleteOne({ _id: imageId }).exec();
  }

  public async getImageByBackgroundId(bgImageId: string): Promise<IFileImageDocument> {
    const image: IFileImageDocument = (await ImageModel.findOne({ bgImageId }).exec()) as IFileImageDocument;
    return image;
  }

  public async getImages(userId: string): Promise<IFileImageDocument[]> {
    const images: IFileImageDocument[] = await ImageModel.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } }
    ]);

    return images;
  }
}

export const imageService: ImageService = new ImageService();
