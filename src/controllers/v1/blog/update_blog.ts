import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

import { logger } from '@/lib/winston';

import Blog, { IBlog } from '@/models/blog';
import User from '@/models/user';

import type { Request, Response } from 'express';

type UpdateBlogData = Partial<
  Pick<IBlog, 'title' | 'content' | 'banner' | 'status'>
>;

const window = new JSDOM('').window;
const purify = DOMPurify(window);

const updateBlog = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, content, banner, status } = req.body as UpdateBlogData;
    const userId = req.userId;
    const { blogId } = req.params;

    const user = await User.findById(userId).select('role').lean().exec();
    if (!user) {
      res.status(404).json({
        code: 'UserNotFound',
        message: 'User not found',
      });
      return;
    }

    const blog = await Blog.findById(blogId).select('-__v').exec();
    if (!blog) {
      res.status(404).json({
        code: 'BlogNotFound',
        message: 'Blog not found',
      });
      return;
    }

    if (blog.author !== userId && user.role !== 'admin') {
      logger.warn(
        `User ${userId} attempted to update blog ${blogId} without permission`,
      );
      res.status(403).json({
        code: 'Forbidden',
        message: 'You do not have permission to update this blog',
      });
      return;
    }

    if (title) {
      const cleanTitle = purify.sanitize(title);
      blog.title = cleanTitle;
    }
    if (content) {
      const cleanContent = purify.sanitize(content);
      blog.content = cleanContent;
    }
    if (banner) blog.banner = banner;
    if (status) blog.status = status;

    await blog.save();

    logger.info(`Blog ${blogId} updated successfully by user ${userId}`);

    res.json({
      code: 'Success',
      message: 'Blog updated successfully',
      data: blog,
    });
  } catch (error) {
    logger.error('Failed to update blog', { error });
    res.status(500).json({
      code: 'InternalServerError',
      message: 'An unexpected error occurred while updating the blog',
    });
  }
};

export default updateBlog;
