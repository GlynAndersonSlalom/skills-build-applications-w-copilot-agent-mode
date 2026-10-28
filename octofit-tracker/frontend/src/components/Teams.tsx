import { CapabilityCard } from './CapabilityCard.js';

type Team = { name: string; members: string[] };

export default function Teams() {
  return <CapabilityCard<Team> title="Teams" path="/api/teams" dataKey="teams" emptyText="No teams yet."
    renderItem={(team) => <><strong>{team.name}</strong>: {team.members.length} members</>} />;
}
