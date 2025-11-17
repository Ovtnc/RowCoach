import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import Club from '../models/Club';

// Create user by coach (for web panel)
export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const coachId = (req as any).userId;
    
    if (!coachId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { email, password, name, role, clubId } = req.body;

    if (!email || !password || !name || !clubId) {
      res.status(400).json({ error: 'Email, password, name, and clubId are required' });
      return;
    }

    // Verify coach has access to this club
    const coach = await User.findById(coachId);
    if (!coach) {
      res.status(404).json({ error: 'Coach not found' });
      return;
    }

    const hasAccess = coach.clubs.some((club: any) => club.toString() === clubId);
    if (!hasAccess) {
      res.status(403).json({ error: 'Access denied to this club' });
      return;
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ error: 'User already exists' });
      return;
    }

    // Verify club exists
    const club = await Club.findById(clubId);
    if (!club) {
      res.status(404).json({ error: 'Club not found' });
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = new User({
      email,
      password: hashedPassword,
      name,
      role: role || 'athlete',
      clubs: [clubId],
    });

    await user.save();

    // Add user to club members
    if (!club.members.includes(user._id as any)) {
      club.members.push(user._id as any);
      await club.save();
    }

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        clubId: clubId,
      },
    });
  } catch (error: any) {
    console.error('Create user error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
};

