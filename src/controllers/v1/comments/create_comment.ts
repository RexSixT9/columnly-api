import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

import { logger } from '@/lib/winston';

import Blog from '@/models/blog';
import Comment from '@/models/comment';

import type { Request, Response } from 'express';

type RequestBody = {
  content: string;
};
type RequestParams = {
  blogId: string;
};

const window = new JSDOM('').window;
const purify = DOMPurify(window);

export const createComments = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { content } = req.body as RequestBody;
  const { blogId } = req.params as RequestParams;
  const userId = req.userId;

  try {
    const blog = await Blog.findById(blogId).select('_id commentsCount').exec();
    if (!blog) {
      res.status(404).json({
        code: 'BlogNotFound',
        message: 'Blog not found',
      });
      return;
    }

    const cleanContent = purify.sanitize(content);

    const newComment = await Comment.create({
      blog: blogId,
      user: userId,
      content: cleanContent,
    });

    blog.commentsCount++;
    await blog.save();

    logger.info(`User ${userId} commented on blog ${blogId}`);

    res.status(201).json({
      code: 'CommentCreated',
      message: 'Comment created successfully',
      comment: newComment,
    });
  } catch (err) {
    logger.error(`Error in createComments: ${err}`);
    res.status(500).json({
      code: 'InternalServerError',
      message: 'An unexpected error occurred while creating the comment',
    });
  }
};
