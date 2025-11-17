import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Workout from '../models/Workout';

export const createWorkout = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const workoutData = req.body;

    const workout = new Workout({
      ...workoutData,
      userId,
    });

    await workout.save();

    res.status(201).json({
      message: 'Workout created successfully',
      workout,
    });
  } catch (error) {
    console.error('Create workout error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getWorkouts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const { limit = 50, skip = 0 } = req.query;

    const workouts = await Workout.find({ userId })
      .sort({ startTime: -1 })
      .limit(Number(limit))
      .skip(Number(skip));

    const total = await Workout.countDocuments({ userId });

    res.json({
      workouts,
      pagination: {
        total,
        limit: Number(limit),
        skip: Number(skip),
        hasMore: total > Number(skip) + workouts.length,
      },
    });
  } catch (error) {
    console.error('Get workouts error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getWorkoutById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const workout = await Workout.findOne({ _id: id, userId });

    if (!workout) {
      res.status(404).json({ error: 'Workout not found' });
      return;
    }

    res.json({ workout });
  } catch (error) {
    console.error('Get workout error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateWorkout = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const updates = req.body;

    const workout = await Workout.findOneAndUpdate(
      { _id: id, userId },
      updates,
      { new: true }
    );

    if (!workout) {
      res.status(404).json({ error: 'Workout not found' });
      return;
    }

    res.json({ message: 'Workout updated successfully', workout });
  } catch (error) {
    console.error('Update workout error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const deleteWorkout = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const workout = await Workout.findOneAndDelete({ _id: id, userId });

    if (!workout) {
      res.status(404).json({ error: 'Workout not found' });
      return;
    }

    res.json({ message: 'Workout deleted successfully' });
  } catch (error) {
    console.error('Delete workout error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getWorkoutStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const { startDate, endDate } = req.query;

    const query: any = { userId };
    if (startDate || endDate) {
      query.startTime = {};
      if (startDate) query.startTime.$gte = new Date(startDate as string);
      if (endDate) query.startTime.$lte = new Date(endDate as string);
    }

    const workouts = await Workout.find(query);

    const stats = {
      totalWorkouts: workouts.length,
      totalDistance: workouts.reduce((sum, w) => sum + w.distance, 0),
      totalDuration: workouts.reduce((sum, w) => sum + w.duration, 0),
      averagePace: workouts.length
        ? workouts.reduce((sum, w) => sum + w.averagePace, 0) / workouts.length
        : 0,
      totalCalories: workouts.reduce((sum, w) => sum + (w.calories || 0), 0),
    };

    res.json({ stats });
  } catch (error) {
    console.error('Get workout stats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getPublicWorkouts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { limit = 20, skip = 0 } = req.query;

    const workouts = await Workout.find({ isPublic: true })
      .populate('userId', 'name profilePicture')
      .sort({ startTime: -1 })
      .limit(Number(limit))
      .skip(Number(skip));

    res.json({ workouts });
  } catch (error) {
    console.error('Get public workouts error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};







