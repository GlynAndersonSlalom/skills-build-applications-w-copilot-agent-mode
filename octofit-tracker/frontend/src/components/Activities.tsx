import { getJson } from '../api/client.js';
import { CapabilityCard } from './CapabilityCard.js';

type Activity = { type: string; minutes: number; points: number };

async function loadActivities() {
  const { activities } = await getJson<{ activities: Activity[] }>('/api/activities');
  return activities;
}

export default function Activities() {
  return <CapabilityCard<Activity> title="Activities" loadItems={loadActivities} emptyText="No activities yet."
    renderItem={(activity) => <><strong>{activity.type}</strong>: {activity.minutes} minutes, {activity.points} points</>} />;
}
