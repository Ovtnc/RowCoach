import mongoose, { Schema, Document } from 'mongoose';

export interface ITraining extends Document {
  title: string;
  description?: string;
  date: Date;
  type: 'water' | 'ergo' | 'custom';
  distance?: number;
  duration?: number; // seconds
  coachId: mongoose.Types.ObjectId;
  clubId: mongoose.Types.ObjectId; // Club-specific training
  ergoDataId?: string;
  completed?: boolean; // Default completion status (can be overridden per user)
  createdAt: Date;
  updatedAt: Date;
}

const TrainingSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    date: {
      type: Date,
      required: true,
    },
    type: {
      type: String,
      enum: ['water', 'ergo', 'custom'],
      required: true,
    },
    distance: {
      type: Number,
    },
    duration: {
      type: Number,
    },
    coachId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    clubId: {
      type: Schema.Types.ObjectId,
      ref: 'Club',
      required: true,
    },
    ergoDataId: {
      type: String,
    },
    completed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
TrainingSchema.index({ coachId: 1, date: -1 });
TrainingSchema.index({ clubId: 1, date: -1 });
TrainingSchema.index({ date: -1 });

export default mongoose.model<ITraining>('Training', TrainingSchema);

