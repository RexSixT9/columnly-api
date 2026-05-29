import { Schema, model } from 'mongoose';

import bcrypt from 'bcrypt';

export interface IUser {
  username: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
  firstName?: string;
  lastName?: string;
  socialLinks?: {
    website?: string;
    instagram?: string;
    facebook?: string;
    x?: string;
    youtube?: string;
  };
}

const userSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: [true, 'Username must be unique'],
      maxLength: [20, 'Username cannot exceed 20 characters'],
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      required: [true, 'Email is required'],
      unique: [true, 'Email must be unique'],
      maxLength: [50, 'Email cannot exceed 50 characters'],
      match: [/.+\@.+\..+/, 'Please use a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minLength: [8, 'Password must be at least 8 characters'],
      select: false, // Exclude password from query results by default
    },
    role: {
      type: String,
      enum: { values: ['user', 'admin'], message: 'Invalid role' },
      default: 'user',
      immutable: true,
    },
    firstName: {
      type: String,
      maxLength: [20, 'First name cannot exceed 20 characters'],
    },
    lastName: {
      type: String,
      maxLength: [20, 'Last name cannot exceed 20 characters'],
    },
    socialLinks: {
      website: {
        type: String,
        maxLength: [200, 'Website URL cannot exceed 200 characters'],
        match: [/^https?:\/\/.+/, 'Invalid URL'],
      },
      instagram: {
        type: String,
        maxLength: [200, 'Instagram URL cannot exceed 200 characters'],
        match: [/^https?:\/\/.+/, 'Invalid URL'],
      },
      facebook: {
        type: String,
        maxLength: [200, 'Facebook URL cannot exceed 200 characters'],
        match: [/^https?:\/\/.+/, 'Invalid URL'],
      },
      x: {
        type: String,
        maxLength: [200, 'X URL cannot exceed 200 characters'],
        match: [/^https?:\/\/.+/, 'Invalid URL'],
      },
      youtube: {
        type: String,
        maxLength: [200, 'YouTube URL cannot exceed 200 characters'],
        match: [/^https?:\/\/.+/, 'Invalid URL'],
      },
    },
  },
  { timestamps: true },
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return;
  }
  this.password = await bcrypt.hash(this.password, 12);
});

export default model<IUser>('User', userSchema);
