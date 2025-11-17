import mongoose, { Schema, Document } from 'mongoose';

export interface IWorkoutSegment {
  type: 'work' | 'rest';
  duration: number; // seconds
  targetPace?: number; // seconds per 500m
  distance?: number; // meters
}

export interface IWorkoutData {
  timestamp: number;
  pace: number; // seconds per 500m
  heartRate?: number;
  strokeRate?: number;
  distance: number; // meters
  speed: number; // m/s
  location?: {
    latitude: number;
    longitude: number;
  };
}

export interface IWorkout extends Document {
  userId: mongoose.Types.ObjectId;
  type: 'free' | 'interval' | 'race' | 'ghost_race';
  title: string;
  description?: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // seconds
  distance: number; // meters
  averagePace: number; // seconds per 500m
  averageStrokeRate?: number;
  averageHeartRate?: number;
  maxHeartRate?: number;
  calories?: number;
  segments?: IWorkoutSegment[];
  workoutData: IWorkoutData[];
  isPublic: boolean;
  sharedWith: mongoose.Types.ObjectId[]; // clubs or communities
  ghostRaceReference?: mongoose.Types.ObjectId; // reference to previous workout for ghost race
  notes?: string;
  weather?: {
    temperature?: number;
    conditions?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const WorkoutSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['free', 'interval', 'race', 'ghost_race'],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: String,
    startTime: {
      type: Date,
      required: true,
      index: true,
    },
    endTime: Date,
    duration: {
      type: Number,
      required: true,
    },
    distance: {
      type: Number,
      required: true,
    },
    averagePace: {
      type: Number,
      required: true,
    },
    averageStrokeRate: Number,
    averageHeartRate: Number,
    maxHeartRate: Number,
    calories: Number,
    segments: [
      {
        type: {
          type: String,
          enum: ['work', 'rest'],
          required: true,
        },
        duration: Number,
        targetPace: Number,
        distance: Number,
      },
    ],
    workoutData: [
      {
        timestamp: Number,
        pace: Number,
        heartRate: Number,
        strokeRate: Number,
        distance: Number,
        speed: Number,
        location: {
          latitude: Number,
          longitude: Number,
        },
      },
    ],
    isPublic: {
      type: Boolean,
      default: false,
    },
    sharedWith: [
      {
        type: Schema.Types.ObjectId,
        refPath: 'onModel',
      },
    ],
    ghostRaceReference: {
      type: Schema.Types.ObjectId,
      ref: 'Workout',
    },
    notes: String,
    weather: {
      temperature: Number,
      conditions: String,
    },
  },
  {
    timestamps: true,
  }
);

// Index for performance queries
WorkoutSchema.index({ userId: 1, startTime: -1 });
WorkoutSchema.index({ sharedWith: 1 });

export default mongoose.model<IWorkout>('Workout', WorkoutSchema);







