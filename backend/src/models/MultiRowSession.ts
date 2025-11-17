import mongoose, { Document, Schema } from 'mongoose';

export interface IMultiRowParticipant {
  userId: string;
  name: string;
  isHost: boolean;
  distance: number;
  strokes: number;
  spm: number;
  split: number;
  status: 'ready' | 'active' | 'finished';
  joinedAt: Date;
}

export interface IMultiRowSession extends Document {
  code: string;
  hostId: string;
  workoutType: 'just-row' | 'interval' | null;
  participants: IMultiRowParticipant[];
  status: 'waiting' | 'active' | 'completed';
  startedAt: Date | null;
  finishedAt: Date | null;
  createdAt: Date;
  expiresAt: Date;
}

const MultiRowParticipantSchema = new Schema({
  userId: { type: String, required: true },
  name: { type: String, required: true },
  isHost: { type: Boolean, default: false },
  distance: { type: Number, default: 0 },
  strokes: { type: Number, default: 0 },
  spm: { type: Number, default: 0 },
  split: { type: Number, default: 0 },
  status: { 
    type: String, 
    enum: ['ready', 'active', 'finished'], 
    default: 'ready' 
  },
  joinedAt: { type: Date, default: Date.now },
});

const MultiRowSessionSchema = new Schema({
  code: { 
    type: String, 
    required: true, 
    unique: true, 
    uppercase: true,
    length: 6,
  },
  hostId: { type: String, required: true },
  workoutType: { 
    type: String, 
    enum: ['just-row', 'interval', null],
    default: null,
  },
  participants: [MultiRowParticipantSchema],
  status: { 
    type: String, 
    enum: ['waiting', 'active', 'completed'], 
    default: 'waiting' 
  },
  startedAt: { type: Date, default: null },
  finishedAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { 
    type: Date, 
    default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
  },
});

// Auto-delete expired sessions
MultiRowSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model<IMultiRowSession>('MultiRowSession', MultiRowSessionSchema);


