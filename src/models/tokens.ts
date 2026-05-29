import { Schema, model, Types } from 'mongoose';

interface IToken {
  userId: Types.ObjectId;
  token: string;
}

const tokenSchema = new Schema<IToken>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: [true, 'User ID is required'],
    },
    token: {
      type: String,
      required: [true, 'Token is required'],
    },
  },
  { timestamps: true },
);

export default model<IToken>('Token', tokenSchema);
