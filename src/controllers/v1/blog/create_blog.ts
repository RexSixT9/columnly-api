import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

import Blog from '@/models/blog';

import { logger } from '@/lib/winston';
import type { Request, Response } from 'express';
import type { IBlog } from '@/models/blog';

type BlogData = Pick<IBlog, 'title' | 'content' | 'banner' | 'status'>;

const window = new JSDOM('').window;
const purify = DOMPurify(window);

export const createBlog = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { title, content, banner, status } = req.body as BlogData;
    const authorId = req.userId;

    const sanitizedTitle = purify.sanitize(title);
    const sanitizedContent = purify.sanitize(content);

    const newBlog = await Blog.create({
      title: sanitizedTitle,
      content: sanitizedContent,
      banner,
      status,
      author: authorId,
    });

    logger.info(`Blog created successfully with ID: ${newBlog._id}`);
    res.status(201).json({
      code: 'BlogCreated',
      message: 'Blog created successfully',
      data: newBlog,
    });
  } catch (error) {
    logger.error(`Error in createBlog: ${error}`);
    res.status(500).json({
      code: 'InternalServerError',
      message: 'An unexpected error occurred',
    });
  }
};
