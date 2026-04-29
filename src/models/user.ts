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
  createdAt: Date;
  updatedAt: Date;
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
      required: [true, 'Email is required'],
      unique: [true, 'Email must be unique'],
      maxLength: [50, 'Email cannot exceed 50 characters'],
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
      },
      instagram: {
        type: String,
        maxLength: [200, 'Instagram URL cannot exceed 200 characters'],
      },
      facebook: {
        type: String,
        maxLength: [200, 'Facebook URL cannot exceed 200 characters'],
      },
      x: {
        type: String,
        maxLength: [200, 'X URL cannot exceed 200 characters'],
      },
      youtube: {
        type: String,
        maxLength: [200, 'YouTube URL cannot exceed 200 characters'],
      },
    },
  },
  { timestamps: true },
);

userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

export default model<IUser>('User', userSchema);
