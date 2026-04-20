import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

const userSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true },
  roleCategory: { type: String, required: true },
  role: { type: String, required: true },
  roleLabel: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  lastLogin: { type: Date },
});

const User = mongoose.model('User', userSchema);

async function createTestUser() {
  await mongoose.connect('mongodb://localhost:27017/signlearn');
  const hashedPassword = await bcrypt.hash('password123', 10);
  const user = await User.updateOne(
    { email: 'test@test.com' },
    {
      id: randomUUID(),
      fullName: 'Test User',
      email: 'test@test.com',
      passwordHash: hashedPassword,
      roleCategory: 'learner',
      role: 'deaf-blind-learner',
      roleLabel: 'Deaf-Blind Learner'
    },
    { upsert: true }
  );
  console.log('✅ Test user created/updated');
  await mongoose.disconnect();
}

createTestUser().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
