import { getJson } from '../api/client.js';
import { CapabilityCard } from './CapabilityCard.js';

type Ranking = { teamName: string; totalPoints: number; rank: number };

async function loadLeaderboard() {
  const { leaderboard } = await getJson<{ leaderboard: Ranking[] }>('/api/leaderboard');
  return leaderboard;
}

export default function Leaderboard() {
  return <CapabilityCard<Ranking> title="Leaderboard" loadItems={loadLeaderboard} emptyText="No rankings yet."
    renderItem={(ranking) => <>{ranking.rank}. <strong>{ranking.teamName}</strong>: {ranking.totalPoints} points</>} />;
}
