import { getJson } from '../api/client.js';
import { CapabilityCard } from './CapabilityCard.js';

type Team = { name: string; members: string[] };

async function loadTeams() {
  const { teams } = await getJson<{ teams: Team[] }>('/api/teams');
  return teams;
}

export default function Teams() {
  return <CapabilityCard<Team> title="Teams" loadItems={loadTeams} emptyText="No teams yet."
    renderItem={(team) => <><strong>{team.name}</strong>: {team.members.length} members</>} />;
}
