import { isObjectIdOrHexString } from 'mongoose';
import { Activity, Team, User, Workout } from '../models/index.js';

const RECENT_ACTIVITY_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;

export async function listActivities() {
  return Activity.find().lean();
}

export async function createActivity(input: unknown) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw Object.assign(new Error('Activity input must be an object'), { status: 400 });
  }
  const { userId, teamId, type, minutes } = input as Record<string, unknown>;
  if (!isObjectIdOrHexString(userId) || !isObjectIdOrHexString(teamId)
    || typeof type !== 'string' || !type.trim()
    || typeof minutes !== 'number' || !Number.isFinite(minutes) || minutes <= 0) {
    throw Object.assign(new Error('Valid userId, teamId, type, and positive minutes are required'), { status: 400 });
  }
  const [user, team] = await Promise.all([User.exists({ _id: userId }), Team.exists({ _id: teamId })]);
  if (!user || !team) {
    throw Object.assign(new Error('User or team not found'), { status: 404 });
  }
  return Activity.create({ user: userId, team: teamId, type: type.trim(), minutes, points: minutes, occurredAt: new Date() });
}

export async function listTeams() {
  return Team.find().lean();
}

export async function createTeam(input: unknown) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw Object.assign(new Error('Team input must be an object'), { status: 400 });
  }
  const { name, mascot, members = [] } = input as Record<string, unknown>;
  if (!Array.isArray(members) || !members.every((member) => isObjectIdOrHexString(member))) {
    throw Object.assign(new Error('Members must be an array of valid user IDs'), { status: 400 });
  }
  const team = new Team({ name, mascot, members });
  const error = team.validateSync();
  if (error) {
    throw Object.assign(error, { status: 400 });
  }
  const memberIds = [...new Set(team.members.map((member) => member.toString()))];
  const memberCount = await User.countDocuments({ _id: { $in: memberIds } });
  if (memberCount !== memberIds.length) {
    throw Object.assign(new Error('One or more members were not found'), { status: 404 });
  }
  return team.save();
}

export async function getLeaderboard() {
  const entries = await Activity.aggregate<{ teamName: string; totalPoints: number }>([
    { $group: { _id: '$team', totalPoints: { $sum: '$points' } } },
    { $lookup: { from: Team.collection.name, localField: '_id', foreignField: '_id', as: 'team' } },
    { $unwind: '$team' },
    { $project: { _id: 0, teamName: '$team.name', totalPoints: 1 } },
    { $sort: { totalPoints: -1, teamName: 1 } },
  ]);
  return entries.map((entry, index) => ({ ...entry, rank: index + 1 }));
}

export async function suggestWorkouts(userEmail: string) {
  const user = await User.findOne({ email: userEmail }).lean();
  if (!user) {
    throw Object.assign(new Error('User not found'), { status: 404 });
  }
  const [pattern] = await Activity.aggregate<{ _id: string; totalMinutes: number }>([
    { $match: { user: user._id, occurredAt: { $gte: new Date(Date.now() - RECENT_ACTIVITY_WINDOW_MS) } } },
    { $group: { _id: '$type', totalMinutes: { $sum: '$minutes' } } },
    { $sort: { totalMinutes: -1, _id: 1 } },
    { $limit: 1 },
  ]);
  const activityFocus = new Map([['run', 'endurance'], ['cycle', 'endurance'], ['strength', 'strength']]);
  const focus = (pattern && activityFocus.get(pattern._id)) ?? user.fitnessGoal;
  const reason = pattern && activityFocus.has(pattern._id)
    ? `Matches your ${pattern._id} activity pattern and ${focus} focus`
    : `Matches your ${focus} fitness goal`;
  const workouts = await Workout.find({ focus }).sort({ title: 1 }).lean();
  return workouts.map((workout) => ({ ...workout, reason }));
}

export { User };
