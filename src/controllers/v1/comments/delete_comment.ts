import { logger } from '@/lib/winston';

import User from '@/models/user';
import Blog from '@/models/blog';
import Comment from '@/models/comment';

import type { Request, Response } from 'express';

type DeleteCommentParams = {
  commentId: string;
};

export const deleteComment = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const currentUserId = req.userId;
    const { commentId } = req.params as DeleteCommentParams;

    const comment = await Comment.findById(commentId)
      .select('userId blogId')
      .lean()
      .exec();
    const user = await User.findById(currentUserId)
      .select('role')
      .lean()
      .exec();

    if (!comment) {
      res.status(404).json({
        code: 'CommentNotFound',
        message: 'Comment not found',
      });
      return;
    }

    if (comment.userId !== currentUserId && user?.role !== 'admin') {
      logger.warn(
        `User ${currentUserId} attempted to delete comment ${commentId} without permission`,
      );
      res.status(403).json({
        code: 'Forbidden',
        message: 'You are not the owner of this comment or an admin',
      });
      return;
    }

    await Comment.findByIdAndDelete(commentId).exec();
    logger.info(`Comment ${commentId} deleted by user ${currentUserId}`);

    const blog = await Blog.findById(comment.blogId)
      .select('commentsCount')
      .exec();

    if (!blog) {
      res.status(404).json({
        code: 'BlogNotFound',
        message: 'Blog not found',
      });
      return;
    }

    blog.commentsCount--;
    await blog.save();

    logger.info(
      `Decremented comments count for blog ${blog._id} after deleting comment ${commentId}`,
    );

    res.status(200).json({
      code: 'CommentDeleted',
      message: 'Comment deleted successfully',
    });
  } catch (err) {
    logger.error(`Error in deleteComment: ${err}`);
    res.status(500).json({
      code: 'InternalServerError',
      message: 'An unexpected error occurred while deleting the comment',
    });
  }
};
