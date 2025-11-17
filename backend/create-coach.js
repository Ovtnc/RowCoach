// Script to create a test coach account
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  name: { type: String, required: true, trim: true },
  role: { type: String, enum: ['athlete', 'coach', 'both'], default: 'athlete' },
  profilePicture: String,
  clubs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Club' }],
  communities: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Community' }],
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);

async function createCoach() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/rowcoach';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    const email = 'coach@rowcoach.com';
    const password = 'coach123';
    const name = 'Test Antrenör';

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('⚠️  User already exists. Updating to coach role...');
      existingUser.role = 'coach';
      const hashedPassword = await bcrypt.hash(password, 10);
      existingUser.password = hashedPassword;
      await existingUser.save();
      console.log('✅ User updated to coach role');
      console.log('\n📧 Email:', email);
      console.log('🔑 Password:', password);
      process.exit(0);
    }

    // Create new coach user
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      email,
      password: hashedPassword,
      name,
      role: 'coach',
    });

    await user.save();
    console.log('✅ Coach account created successfully!');
    console.log('\n📧 Email:', email);
    console.log('🔑 Password:', password);
    console.log('\nYou can now login to the web panel with these credentials.');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createCoach();

