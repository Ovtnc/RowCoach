import mongoose, { Schema, Document } from 'mongoose';

export interface ICommunity extends Document {
  name: string;
  description?: string;
  image?: string;
  creator: mongoose.Types.ObjectId;
  members: mongoose.Types.ObjectId[];
  isPublic: boolean;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const CommunitySchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
    },
    image: {
      type: String,
    },
    creator: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    members: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    isPublic: {
      type: Boolean,
      default: true,
    },
    tags: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<ICommunity>('Community', CommunitySchema);









