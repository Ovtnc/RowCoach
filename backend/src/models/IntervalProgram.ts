import mongoose, { Schema, Document } from 'mongoose';
import { IWorkoutSegment } from './Workout';

export interface IIntervalProgram extends Document {
  name: string;
  description?: string;
  createdBy: mongoose.Types.ObjectId;
  clubId?: mongoose.Types.ObjectId;
  segments: IWorkoutSegment[];
  totalDuration: number; // seconds
  totalDistance?: number; // meters
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  isTemplate: boolean;
  isPublic: boolean;
  scheduledFor?: Date;
  participants?: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const IntervalProgramSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    clubId: {
      type: Schema.Types.ObjectId,
      ref: 'Club',
    },
    segments: [
      {
        type: {
          type: String,
          enum: ['work', 'rest'],
          required: true,
        },
        duration: {
          type: Number,
          required: true,
        },
        targetPace: Number,
        distance: Number,
      },
    ],
    totalDuration: {
      type: Number,
      required: true,
    },
    totalDistance: {
      type: Number,
    },
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'intermediate',
    },
    isTemplate: {
      type: Boolean,
      default: false,
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    scheduledFor: {
      type: Date,
    },
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IIntervalProgram>('IntervalProgram', IntervalProgramSchema);









