import { genSlug } from '@/utils';
import { Schema, model, Types } from 'mongoose';

export interface IBlog {
  title: string;
  content: string;
  slug: string;
  banner: {
    url: string;
    publicId: string;
    width: number;
    height: number;
  };
  author: Types.ObjectId;
  viewsCount: number;
  likesCount: number;
  commentsCount: number;
  status: 'draft' | 'published';
  createdAt: Date;
  updatedAt: Date;
}

const blogSchema = new Schema<IBlog>(
  {
    title: { type: String, required: true, maxlength: 180 },
    content: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    banner: {
      url: { type: String, required: true },
      publicId: { type: String, required: true },
      width: { type: Number, required: true },
      height: { type: Number, required: true },
    },
    author: { type: Types.ObjectId, ref: 'User', required: true },
    viewsCount: { type: Number, default: 0 },
    likesCount: { type: Number, default: 0 },
    commentsCount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['draft', 'published'],
      message: '{VALUE} is not a valid status',
      default: 'draft',
    },
  },
  {
    timestamps: {
      createdAt: 'publishedAt',
    },
  },
);

blogSchema.pre('validate', function (this: IBlog & { slug?: string }) {
  if (this.title && !this.slug) {
    this.slug = genSlug(this.title);
  }
});

export default model<IBlog>('Blog', blogSchema);
