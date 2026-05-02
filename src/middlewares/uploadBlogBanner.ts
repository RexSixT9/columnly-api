import uploadToCloudinary from '@/lib/cloudinary';
import { logger } from '@/lib/winston';

import Blog from '@/models/blog';
import { UploadApiErrorResponse } from 'cloudinary';

import type { Request, Response, NextFunction } from 'express';

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

const uploadBlogBanner = (method: 'post' | 'put') => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      if (method === 'put' && !req.file) {
        return next();
      }

      if (!req.file) {
        res.status(400).json({
          code: 'BadRequest',
          message: 'Banner image is required',
        });
        return;
      }

      if (req.file.size > MAX_FILE_SIZE) {
        res.status(413).json({
          code: 'PayloadTooLarge',
          message: 'Banner image must be less than 2MB',
        });
        return;
      }

      let publicId: string | undefined;

      if (method === 'put') {
        const { blogId } = req.params;
        const blog = await Blog.findById(blogId)
          .select('banner.publicId')
          .exec();

        if (!blog) {
          res.status(404).json({
            code: 'NotFound',
            message: 'Blog not found',
          });
          return;
        }

        publicId = blog.banner.publicId.replace('columnly_blogs/', '');
      }

      const data = await uploadToCloudinary(req.file.buffer, publicId);

      if (!data) {
        logger.error('Failed to upload banner image', {
          blogId: method === 'put' ? req.params.blogId : 'new blog',
        });
        res.status(500).json({
          code: 'InternalServerError',
          message: 'Failed to upload banner image',
        });
        return;
      }

      const newBanner = {
        publicId: data.public_id,
        url: data.secure_url,
        width: data.width,
        height: data.height,
      };

      logger.info('Banner image uploaded successfully', {
        blogId: method === 'put' ? req.params.blogId : 'new blog',
        banner: newBanner,
      });

      req.body.banner = newBanner;

      next();
    } catch (err: UploadApiErrorResponse | any) {
      logger.error(`Error in uploadBlogBanner: ${err.message || err}`, {
        stack: err.stack,
      });
      res.status(500).json({
        code: 'InternalServerError',
        message: 'An unexpected error occurred',
      });
    }
  };
};

export default uploadBlogBanner;
