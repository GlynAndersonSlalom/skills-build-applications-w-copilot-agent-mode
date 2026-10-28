import { CapabilityCard } from './CapabilityCard.js';

type Ranking = { teamName: string; totalPoints: number; rank: number };

export default function Leaderboard() {
  return <CapabilityCard<Ranking> title="Leaderboard" path="/api/leaderboard" dataKey="leaderboard" emptyText="No rankings yet."
    renderItem={(ranking) => <>{ranking.rank}. <strong>{ranking.teamName}</strong>: {ranking.totalPoints} points</>} />;
}
