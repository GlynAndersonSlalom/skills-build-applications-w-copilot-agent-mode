import { afterAll, beforeAll, expect, it } from 'vitest';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { createApp } from '../src/app.js';
import { Activity, Team, User, Workout } from '../src/models/index.js';

let mongo: MongoMemoryServer;
const app = createApp();

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
}, 60_000);
afterAll(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});

async function createUserAndTeam(name: string, email: string, mascot: string, teamName = `${name} team`) {
  const team = await Team.create({ name: teamName, mascot, members: [] });
  const user = await User.create({ name, email, team: team._id, fitnessGoal: 'endurance' });
  await Team.updateOne({ _id: team._id }, { $addToSet: { members: user._id } });
  return { user, team };
}

it('ignores activity older than 30 days and falls back to the fitness goal', async () => {
  const { user, team } = await createUserAndTeam('Mona', 'mona@example.com', 'Mona');
  await User.updateOne({ _id: user._id }, { $set: { fitnessGoal: 'strength' } });
  await Activity.create({
    user: user._id,
    team: team._id,
    type: 'run',
    minutes: 120,
    points: 120,
    occurredAt: new Date(Date.now() - 31 * 24 * 60 * 60 * 1000),
  });
  await Workout.create([
    { title: 'Intervals', focus: 'endurance', minutes: 30, difficulty: 'moderate' },
    { title: 'Strength Circuit', focus: 'strength', minutes: 30, difficulty: 'moderate' },
  ]);

  const response = await request(app).get('/api/workouts/suggestions/mona%40example.com');

  expect(response.status).toBe(200);
  expect(response.body.suggestions).toHaveLength(1);
  expect(response.body.suggestions[0]).toMatchObject({
    title: 'Strength Circuit',
    focus: 'strength',
    reason: expect.stringMatching(/fitness goal/i),
  });
});