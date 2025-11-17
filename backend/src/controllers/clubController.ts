import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Club from '../models/Club';
import User from '../models/User';
import crypto from 'crypto';

export const createClub = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const { name, description, isPublic, location } = req.body;

    // Generate unique invitation code
    const invitationCode = crypto.randomBytes(8).toString('hex');

    const club = new Club({
      name,
      description,
      owner: userId,
      coaches: [userId],
      members: [userId],
      invitationCode,
      isPublic: isPublic || false,
      location,
    });

    await club.save();

    // Add club to user's clubs
    await User.findByIdAndUpdate(userId, {
      $addToSet: { clubs: club._id },
    });

    res.status(201).json({
      message: 'Club created successfully',
      club,
    });
  } catch (error) {
    console.error('Create club error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getClub = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const club = await Club.findById(id)
      .populate('owner', 'name profilePicture')
      .populate('coaches', 'name profilePicture')
      .populate('members', 'name profilePicture');

    if (!club) {
      res.status(404).json({ error: 'Club not found' });
      return;
    }

    // Check if user is owner or coach - only they can see invitation code
    const isOwner = club.owner._id.toString() === userId;
    const isCoach = club.coaches.some(
      (coach: any) => coach._id.toString() === userId
    );

    // If user is not owner or coach, remove invitation code
    const clubData: any = club.toObject();
    if (!isOwner && !isCoach) {
      delete clubData.invitationCode;
    }

    res.json({ club: clubData });
  } catch (error) {
    console.error('Get club error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const joinClub = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const { invitationCode } = req.body;

    const club = await Club.findOne({ invitationCode });

    if (!club) {
      res.status(404).json({ error: 'Invalid invitation code' });
      return;
    }

    // Add user to club members
    if (!club.members.includes(userId as any)) {
      club.members.push(userId as any);
      await club.save();

      // Add club to user's clubs
      await User.findByIdAndUpdate(userId, {
        $addToSet: { clubs: club._id },
      });
    }

    res.json({
      message: 'Successfully joined club',
      club,
    });
  } catch (error) {
    console.error('Join club error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const addCoach = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const { coachId } = req.body;

    const club = await Club.findById(id);

    if (!club) {
      res.status(404).json({ error: 'Club not found' });
      return;
    }

    // Check if user is owner
    if (club.owner.toString() !== userId) {
      res.status(403).json({ error: 'Only club owner can add coaches' });
      return;
    }

    // Add coach
    if (!club.coaches.includes(coachId)) {
      club.coaches.push(coachId);
      await club.save();
    }

    res.json({
      message: 'Coach added successfully',
      club,
    });
  } catch (error) {
    console.error('Add coach error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getPublicClubs = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const clubs = await Club.find({ isPublic: true })
      .select('-invitationCode')
      .populate('owner', 'name')
      .limit(50);

    res.json(clubs);
  } catch (error) {
    console.error('Get public clubs error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getClubWorkouts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { limit = 50, skip = 0 } = req.query;

    const club = await Club.findById(id);

    if (!club) {
      res.status(404).json({ error: 'Club not found' });
      return;
    }

    const { default: Workout } = await import('../models/Workout');
    const workouts = await Workout.find({ sharedWith: id })
      .populate('userId', 'name profilePicture')
      .sort({ startTime: -1 })
      .limit(Number(limit))
      .skip(Number(skip));

    res.json({ workouts });
  } catch (error) {
    console.error('Get club workouts error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};







