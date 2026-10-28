import { CapabilityCard } from './CapabilityCard.js';

type Workout = { title: string; reason: string };

export default function Workouts() {
  return <CapabilityCard<Workout> title="Workout suggestions" path={`/api/workouts/suggestions/${encodeURIComponent('mona@example.com')}`} dataKey="suggestions" emptyText="No workout suggestions yet."
    renderItem={(workout) => <><strong>{workout.title}</strong>: {workout.reason}</>} />;
}
