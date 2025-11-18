import { Request, Response } from 'express';
import MultiRowSession from '../models/MultiRowSession';

// Generate unique 6-character session code
const generateSessionCode = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude confusing chars
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// Create new multi-row session
export const createSession = async (req: Request, res: Response) => {
  try {
    const { hostId, hostName } = req.body;

    if (!hostId || !hostName) {
      return res.status(400).json({ message: 'Host ID and name are required' });
    }

    let code = generateSessionCode();
    let exists = await MultiRowSession.findOne({ code });
    
    // Ensure unique code
    while (exists) {
      code = generateSessionCode();
      exists = await MultiRowSession.findOne({ code });
    }

    const session = new MultiRowSession({
      code,
      hostId,
      participants: [{
        userId: hostId,
        name: hostName,
        isHost: true,
        status: 'ready',
      }],
    });

    await session.save();

    res.status(201).json({
      session: {
        code: session.code,
        hostId: session.hostId,
        workoutType: session.workoutType,
        intervalPlan: session.intervalPlan || [],
        participants: session.participants,
        status: session.status,
      },
    });
  } catch (error) {
    console.error('Create session error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Join existing session
export const joinSession = async (req: Request, res: Response) => {
  try {
    const { code, userId, userName } = req.body;

    if (!code || !userId || !userName) {
      return res.status(400).json({ message: 'Code, user ID, and name are required' });
    }

    const session = await MultiRowSession.findOne({ 
      code: code.toUpperCase(),
      status: 'waiting',
    });

    if (!session) {
      return res.status(404).json({ message: 'Session not found or already started' });
    }

    // Check if user already in session
    const existing = session.participants.find(p => p.userId === userId);
    if (existing) {
      return res.status(400).json({ message: 'Already in this session' });
    }

    // Add participant
    session.participants.push({
      userId,
      name: userName,
      isHost: false,
      distance: 0,
      strokes: 0,
      spm: 0,
      split: 0,
      status: 'ready',
      joinedAt: new Date(),
    });

    await session.save();

    res.json({
      session: {
        code: session.code,
        hostId: session.hostId,
        workoutType: session.workoutType,
        intervalPlan: session.intervalPlan || [],
        participants: session.participants,
        status: session.status,
      },
    });
  } catch (error) {
    console.error('Join session error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update session workout type
export const updateWorkoutType = async (req: Request, res: Response) => {
  try {
    const { code, workoutType, userId } = req.body;

    const session = await MultiRowSession.findOne({ code: code?.toUpperCase() });

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    if (session.hostId !== userId) {
      return res.status(403).json({ message: 'Only host can update workout type' });
    }

    session.workoutType = workoutType;
    await session.save();

    res.json({ session });
  } catch (error) {
    console.error('Update workout type error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Start session
export const startSession = async (req: Request, res: Response) => {
  try {
    const { code, userId } = req.body;

    const session = await MultiRowSession.findOne({ code: code?.toUpperCase() });

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    if (session.hostId !== userId) {
      return res.status(403).json({ message: 'Only host can start session' });
    }

    session.status = 'active';
    session.startedAt = new Date();
    await session.save();

    res.json({ session });
  } catch (error) {
    console.error('Start session error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update participant stats
export const updateParticipantStats = async (req: Request, res: Response) => {
  try {
    const { code, userId, stats } = req.body;

    const session = await MultiRowSession.findOne({ code: code?.toUpperCase() });

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    const participant = session.participants.find(p => p.userId === userId);
    if (!participant) {
      return res.status(404).json({ message: 'Participant not found' });
    }

    // Update stats
    Object.assign(participant, stats);
    await session.save();

    res.json({ session });
  } catch (error) {
    console.error('Update stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get session data
export const getSession = async (req: Request, res: Response) => {
  try {
    const { code } = req.params;

    const session = await MultiRowSession.findOne({ code: code.toUpperCase() });

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    res.json({ session });
  } catch (error) {
    console.error('Get session error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update interval plan
export const updateIntervalPlan = async (req: Request, res: Response) => {
  try {
    const { code, userId, intervalPlan } = req.body;

    const upperCode = code?.toUpperCase();
    console.log('Update interval plan request:', {
      originalCode: code,
      upperCode,
      userId,
      intervalPlanLength: intervalPlan?.length,
      intervalPlan: intervalPlan,
    });

    if (!code || !userId) {
      return res.status(400).json({ message: 'Code and userId are required' });
    }

    if (!Array.isArray(intervalPlan)) {
      return res.status(400).json({ message: 'intervalPlan must be an array' });
    }

    const session = await MultiRowSession.findOne({ code: upperCode });

    if (!session) {
      // Tüm session'ları kontrol et (debug için)
      const allSessions = await MultiRowSession.find({}).select('code').limit(10);
      console.error('Session not found for code:', {
        searchedCode: upperCode,
        originalCode: code,
        availableSessions: allSessions.map(s => s.code),
      });
      return res.status(404).json({ message: 'Session not found' });
    }

    if (session.hostId !== userId) {
      console.error('User is not host:', { sessionHostId: session.hostId, userId });
      return res.status(403).json({ message: 'Only host can update interval plan' });
    }

    if (session.workoutType !== 'interval') {
      console.error('Workout type is not interval:', { workoutType: session.workoutType });
      return res.status(400).json({ message: 'Workout type must be interval' });
    }

    session.intervalPlan = intervalPlan || [];
    await session.save();

    console.log('Interval plan updated successfully:', {
      code: session.code,
      planLength: session.intervalPlan.length,
    });

    res.json({ session });
  } catch (error: any) {
    console.error('Update interval plan error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
    });
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Finish session
export const finishSession = async (req: Request, res: Response) => {
  try {
    const { code } = req.body;

    const session = await MultiRowSession.findOne({ code: code?.toUpperCase() });

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    session.status = 'completed';
    session.finishedAt = new Date();
    await session.save();

    res.json({ session });
  } catch (error) {
    console.error('Finish session error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


