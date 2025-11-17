import { Request, Response } from 'express';
import Training, { ITraining } from '../models/Training';
import User from '../models/User';
import UserTrainingCompletion from '../models/UserTrainingCompletion';

// Get all trainings (for mobile app - club-specific)
export const getTrainings = async (req: Request, res: Response) => {
  try {
    const { clubId } = req.query;
    const userId = (req as any).userId;
    
    if (!clubId) {
      return res.status(400).json({ error: 'clubId is required' });
    }

    const trainings = await Training.find({ clubId })
      .populate('coachId', 'name email')
      .populate('clubId', 'name')
      .sort({ date: -1 })
      .limit(100);

    // If user is logged in, get their completion status for each training
    if (userId) {
      const completionMap = new Map();
      const completions = await UserTrainingCompletion.find({
        userId,
        trainingId: { $in: trainings.map(t => t._id) },
      });

      completions.forEach((comp) => {
        completionMap.set(comp.trainingId.toString(), comp.completed);
      });

      // Add completion status to each training
      const trainingsWithCompletion = trainings.map((training) => {
        const trainingObj = training.toObject();
        const completionStatus = completionMap.get(training._id.toString());
        return {
          ...trainingObj,
          completed: completionStatus !== undefined ? completionStatus : (training.completed || false),
        };
      });

      return res.json(trainingsWithCompletion);
    }

    res.json(trainings);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Get trainings by coach (for web panel - filtered by club)
export const getCoachTrainings = async (req: Request, res: Response) => {
  try {
    const coachId = (req as any).userId;
    const { clubId } = req.query;
    
    if (!coachId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get user's clubs
    const user = await User.findById(coachId).populate('clubs');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const query: any = { coachId };
    
    // If clubId is provided, filter by that club (and verify coach has access)
    if (clubId) {
      const hasAccess = user.clubs.some((club: any) => club._id.toString() === clubId);
      if (!hasAccess) {
        return res.status(403).json({ error: 'Access denied to this club' });
      }
      query.clubId = clubId;
    }

    const trainings = await Training.find(query)
      .populate('clubId', 'name')
      .sort({ date: -1 });

    res.json(trainings);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Create training (for web panel)
export const createTraining = async (req: Request, res: Response) => {
  try {
    const coachId = (req as any).userId;
    
    if (!coachId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { title, description, date, type, distance, duration, ergoDataId, clubId } = req.body;

    if (!title || !date || !type || !clubId) {
      return res.status(400).json({ error: 'Title, date, type, and clubId are required' });
    }

    // Verify coach has access to this club
    const user = await User.findById(coachId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const hasAccess = user.clubs.some((club: any) => club.toString() === clubId);
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied to this club' });
    }

    const training = new Training({
      title,
      description,
      date: new Date(date),
      type,
      distance,
      duration,
      ergoDataId,
      coachId,
      clubId,
    });

    await training.save();
    await training.populate('coachId', 'name email');
    await training.populate('clubId', 'name');

    res.status(201).json(training);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Update training
export const updateTraining = async (req: Request, res: Response) => {
  try {
    const coachId = (req as any).userId;
    const { id } = req.params;

    if (!coachId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const training = await Training.findOne({ _id: id, coachId });

    if (!training) {
      return res.status(404).json({ error: 'Training not found' });
    }

    const { title, description, date, type, distance, duration, ergoDataId, clubId } = req.body;

    // If clubId is being updated, verify access
    if (clubId && clubId !== training.clubId.toString()) {
      const user = await User.findById(coachId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      const hasAccess = user.clubs.some((club: any) => club.toString() === clubId);
      if (!hasAccess) {
        return res.status(403).json({ error: 'Access denied to this club' });
      }
      training.clubId = clubId as any;
    }

    if (title) training.title = title;
    if (description !== undefined) training.description = description;
    if (date) training.date = new Date(date);
    if (type) training.type = type;
    if (distance !== undefined) training.distance = distance;
    if (duration !== undefined) training.duration = duration;
    if (ergoDataId !== undefined) training.ergoDataId = ergoDataId;

    await training.save();
    await training.populate('coachId', 'name email');

    res.json(training);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Delete training
export const deleteTraining = async (req: Request, res: Response) => {
  try {
    const coachId = (req as any).userId;
    const { id } = req.params;

    if (!coachId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const training = await Training.findOneAndDelete({ _id: id, coachId });

    if (!training) {
      return res.status(404).json({ error: 'Training not found' });
    }

    res.json({ message: 'Training deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

