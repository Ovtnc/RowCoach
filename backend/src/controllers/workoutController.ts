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
    res.status(201).json({ workout });
  } catch (error: any) {
    console.error('Create workout error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getWorkouts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const workouts = await Workout.find({ userId })
      .sort({ startTime: -1 })
      .limit(50);

    res.json({ workouts });
  } catch (error: any) {
    console.error('Get workouts error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getWorkout = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const workout = await Workout.findOne({ _id: id, userId });

    if (!workout) {
      res.status(404).json({ error: 'Workout not found' });
      return;
    }

    res.json({ workout });
  } catch (error: any) {
    console.error('Get workout error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateWorkout = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const updateData = req.body;

    const workout = await Workout.findOneAndUpdate(
      { _id: id, userId },
      updateData,
      { new: true }
    );

    if (!workout) {
      res.status(404).json({ error: 'Workout not found' });
      return;
    }

    res.json({ workout });
  } catch (error: any) {
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
  } catch (error: any) {
    console.error('Delete workout error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
