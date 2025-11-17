import mongoose, { Schema, Document } from 'mongoose';

export interface IUserTrainingCompletion extends Document {
  userId: mongoose.Types.ObjectId;
  trainingId: mongoose.Types.ObjectId;
  completed: boolean;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserTrainingCompletionSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    trainingId: {
      type: Schema.Types.ObjectId,
      ref: 'Training',
      required: true,
    },
    completed: {
      type: Boolean,
      default: false,
      required: true,
    },
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Unique index: one completion record per user-training pair
UserTrainingCompletionSchema.index({ userId: 1, trainingId: 1 }, { unique: true });

export default mongoose.model<IUserTrainingCompletion>('UserTrainingCompletion', UserTrainingCompletionSchema);

