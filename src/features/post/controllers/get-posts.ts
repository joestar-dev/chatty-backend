
import { Request, Response } from 'express';
import { IPostDocument } from '@post/interfaces/post.interface';
import { PostCache } from '@service/redis/post.cache';
import HTTP_STATUS from 'http-status-codes';
import { postService } from '@service/db/post.service';

export const postCache: PostCache = new PostCache();

const PAGE_SIZE = 10;

export class Get {
  public async posts(req: Request, res: Response): Promise<void> {
    const { page } = req.params;
    const skip: number = (parseInt(page) - 1) * PAGE_SIZE;
    const limit: number = parseInt(page) * PAGE_SIZE;
    const newSkip: number = skip === 0 ? skip : skip + 1;
    let posts: IPostDocument[] = [];
    let totalPosts = 0
    const cachedPosts: IPostDocument[] = await postCache.getPostsFromCache('post', newSkip, limit);
    if (cachedPosts.length) {
      posts = cachedPosts;
      totalPosts = await postCache.getTotalPostInCache();
    } else {
      posts = await postService.getPosts({}, skip, limit, { createdAt: -1 });
      totalPosts = await postService.postsCount();
    }

    res.status(HTTP_STATUS.OK).json({ message: 'All posts', posts, totalPosts });
  }

  public async postsWithImages(req: Request, res: Response): Promise<void> {
    const { page } = req.params;
    const skip: number = (parseInt(page) - 1) * PAGE_SIZE;
    const limit: number = parseInt(page) * PAGE_SIZE;
    const newSkip: number = skip === 0 ? skip : skip + 1;
    let posts: IPostDocument[] = [];
    // let totalPosts = 0
    const cachedPosts: IPostDocument[] = await postCache.getPostWithImagesFromCache('post', newSkip, limit);
    // if (cachedPosts.length) {
    //   posts = cachedPosts;
    //   totalPosts = await postCache.getTotalPostInCache();
    // } else {
    //   posts = await postService.getPosts({ imgId: '$ne', gifUrl: '$ne' }, skip, limit, { createdAt: -1 });
    //   totalPosts = await postService.postsCount();
    // }

    posts = cachedPosts.length ? cachedPosts : await postService.getPosts({ imgId: '$ne', gifUrl: '$ne' }, skip, limit, { createdAt: -1 });

    res.status(HTTP_STATUS.OK).json({ message: 'All posts with images', posts });
  }

  public async postsWithVideo(req: Request, res: Response): Promise<void> {
    const { page } = req.params;
    const skip: number = (parseInt(page) - 1) * PAGE_SIZE;
    const limit: number = parseInt(page) * PAGE_SIZE;
    const newSkip: number = skip === 0 ? skip : skip + 1;
    let posts: IPostDocument[] = [];
    const cachedPosts: IPostDocument[] = await postCache.getPostWithVideosFromCache('post', newSkip, limit);

    posts = cachedPosts.length ? cachedPosts : await postService.getPosts({ videoId: '$ne' }, skip, limit, { createdAt: -1 });

    res.status(HTTP_STATUS.OK).json({ message: 'All posts with videos', posts });
  }
}

