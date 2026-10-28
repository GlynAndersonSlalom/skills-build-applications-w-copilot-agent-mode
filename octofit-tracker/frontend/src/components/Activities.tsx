import { CapabilityCard } from './CapabilityCard.js';

type Activity = { type: string; minutes: number; points: number };

export default function Activities() {
  return <CapabilityCard<Activity> title="Activities" path="/api/activities" dataKey="activities" emptyText="No activities yet."
    renderItem={(activity) => <><strong>{activity.type}</strong>: {activity.minutes} minutes, {activity.points} points</>} />;
}
