import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  role: 'athlete' | 'coach' | 'both';
  profilePicture?: string;
  clubs: mongoose.Types.ObjectId[];
  communities: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ['athlete', 'coach', 'both'],
      default: 'athlete',
    },
    profilePicture: {
      type: String,
    },
    clubs: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Club',
      },
    ],
    communities: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Community',
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IUser>('User', UserSchema);





