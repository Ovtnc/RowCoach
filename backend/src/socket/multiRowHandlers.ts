import { Server, Socket } from 'socket.io';
import MultiRowSession from '../models/MultiRowSession';

export const setupMultiRowHandlers = (io: Server, socket: Socket) => {
  // Join session room
  socket.on('multi-row:join', async (sessionCode: string) => {
    try {
      socket.join(`session-${sessionCode}`);
      console.log(`Socket ${socket.id} joined session ${sessionCode}`);
      
      // Notify others
      socket.to(`session-${sessionCode}`).emit('multi-row:participant-joined', {
        socketId: socket.id,
        timestamp: Date.now(),
      });

      // Send current session state to the joiner
      const session = await MultiRowSession.findOne({ code: sessionCode });
      if (session) {
        socket.emit('multi-row:session-state', {
          session: {
            code: session.code,
            hostId: session.hostId,
            workoutType: session.workoutType,
            participants: session.participants,
            status: session.status,
            startedAt: session.startedAt,
          },
        });
      }
    } catch (error) {
      console.error('Join session error:', error);
    }
  });

  // Update participant stats
  socket.on('multi-row:update-stats', async (data: any) => {
    try {
      const { sessionCode, userId, stats } = data;
      
      // Update in database
      const session = await MultiRowSession.findOne({ code: sessionCode });
      if (session) {
        const participant = session.participants.find(p => p.userId === userId);
        if (participant) {
          participant.distance = stats.distance || participant.distance;
          participant.strokes = stats.strokes || participant.strokes;
          participant.spm = stats.spm || participant.spm;
          participant.split = stats.split || participant.split;
          participant.status = 'active';
          
          await session.save();
          
          // Broadcast to all participants in the session (including sender)
          io.to(`session-${sessionCode}`).emit('multi-row:stats-updated', {
            userId,
            stats: {
              distance: participant.distance,
              strokes: participant.strokes,
              spm: participant.spm,
              split: participant.split,
            },
            timestamp: Date.now(),
          });
        }
      }
    } catch (error) {
      console.error('Update stats error:', error);
    }
  });

  // Host selects workout type
  socket.on('multi-row:select-workout', async (data: any) => {
    try {
      const { sessionCode, workoutType } = data;
      
      const session = await MultiRowSession.findOne({ code: sessionCode });
      if (session) {
        session.workoutType = workoutType;
        await session.save();
        
        io.to(`session-${sessionCode}`).emit('multi-row:workout-selected', {
          workoutType,
        });
      }
    } catch (error) {
      console.error('Select workout error:', error);
    }
  });

  // Host starts workout
  socket.on('multi-row:start-workout', async (sessionCode: string) => {
    try {
      const session = await MultiRowSession.findOne({ code: sessionCode });
      if (session) {
        session.status = 'active';
        session.startedAt = new Date();
        await session.save();
        
        const startTime = Date.now();
        
        // Start for everyone
        io.to(`session-${sessionCode}`).emit('multi-row:workout-started', {
          startTime,
        });
      }
    } catch (error) {
      console.error('Start workout error:', error);
    }
  });

  // Participant finishes
  socket.on('multi-row:finish', async (data: any) => {
    try {
      const { sessionCode, userId } = data;
      
      const session = await MultiRowSession.findOne({ code: sessionCode });
      if (session) {
        const participant = session.participants.find(p => p.userId === userId);
        if (participant) {
          participant.status = 'finished';
          await session.save();
          
          socket.to(`session-${sessionCode}`).emit('multi-row:participant-finished', {
            userId,
            timestamp: Date.now(),
          });
        }
        
        // Check if all finished
        const allFinished = session.participants.every(p => p.status === 'finished');
        if (allFinished) {
          session.status = 'completed';
          session.finishedAt = new Date();
          await session.save();
          
          io.to(`session-${sessionCode}`).emit('multi-row:session-completed', {
            timestamp: Date.now(),
          });
        }
      }
    } catch (error) {
      console.error('Finish error:', error);
    }
  });

  // Leave session
  socket.on('multi-row:leave', async (sessionCode: string) => {
    socket.leave(`session-${sessionCode}`);
    socket.to(`session-${sessionCode}`).emit('multi-row:participant-left', {
      socketId: socket.id,
    });
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
};


