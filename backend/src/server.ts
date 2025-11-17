import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import connectDB from './config/database';
import authRoutes from './routes/authRoutes';
import workoutRoutes from './routes/workoutRoutes';
import clubRoutes from './routes/clubRoutes';
import multiRowRoutes from './routes/multiRowRoutes';
import trainingRoutes from './routes/trainingRoutes';
import userRoutes from './routes/userRoutes';
import { setupMultiRowHandlers } from './socket/multiRowHandlers';

// Load environment variables
dotenv.config();

// Create Express app
const app: Application = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/clubs', clubRoutes);
app.use('/api/multi-row', multiRowRoutes);
app.use('/api/trainings', trainingRoutes);
app.use('/api/users', userRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Socket.IO for real-time features
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Setup Multi-Row handlers
  setupMultiRowHandlers(io, socket);

  // Legacy workout sync (keep for backwards compatibility)
  socket.on('join-workout', (workoutId: string) => {
    socket.join(`workout-${workoutId}`);
    console.log(`Socket ${socket.id} joined workout ${workoutId}`);
  });

  socket.on('start-workout', (workoutId: string) => {
    io.to(`workout-${workoutId}`).emit('workout-started', {
      startTime: Date.now(),
    });
  });

  socket.on('workout-data', (data: any) => {
    socket.to(`workout-${data.workoutId}`).emit('participant-data', {
      userId: data.userId,
      pace: data.pace,
      distance: data.distance,
      timestamp: data.timestamp,
    });
  });

  socket.on('leave-workout', (workoutId: string) => {
    socket.leave(`workout-${workoutId}`);
    console.log(`Socket ${socket.id} left workout ${workoutId}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Connect to database and start server
const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await connectDB();
    
    httpServer.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📡 WebSocket server ready`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export { io };



