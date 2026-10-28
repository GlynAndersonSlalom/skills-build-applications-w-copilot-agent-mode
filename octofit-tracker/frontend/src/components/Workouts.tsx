import { getJson } from '../api/client.js';
import { CapabilityCard } from './CapabilityCard.js';

type Workout = { title: string; reason: string };

async function loadWorkouts() {
  const { suggestions } = await getJson<{ suggestions: Workout[] }>(`/api/workouts/suggestions/${encodeURIComponent('mona@example.com')}`);
  return suggestions;
}

export default function Workouts() {
  return <CapabilityCard<Workout> title="Workout suggestions" loadItems={loadWorkouts} emptyText="No workout suggestions yet."
    renderItem={(workout) => <><strong>{workout.title}</strong>: {workout.reason}</>} />;
}
