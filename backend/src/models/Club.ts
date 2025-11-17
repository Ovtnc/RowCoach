import mongoose, { Schema, Document } from 'mongoose';

export interface IClub extends Document {
  name: string;
  description?: string;
  logo?: string;
  owner: mongoose.Types.ObjectId;
  coaches: mongoose.Types.ObjectId[];
  members: mongoose.Types.ObjectId[];
  invitationCode: string;
  isPublic: boolean;
  location?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ClubSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
    },
    logo: {
      type: String,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    coaches: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    members: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    invitationCode: {
      type: String,
      required: true,
      unique: true,
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    location: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IClub>('Club', ClubSchema);







