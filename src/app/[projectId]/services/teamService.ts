import { Member, ProjectTeam } from '../components/Team/MemberCard/Member';
import { TeamGroupData } from '../components/Team/TeamGroup/TeamGroup';

type ApiMember = {
    usuario: { id: number; nome: string };
    papel: string;
};

function toInitials(nome: string): string {
    const words = nome.trim().split(/\s+/);
    return (words[0][0] + (words[1]?.[0] ?? '')).toUpperCase();
}

function mapRole(papel: string): Member['role'] {
    if (papel === 'scrum_master') return 'scrum_master';
    if (papel === 'product_owner') return 'product_owner';
    return 'member';
}

export interface TeamData {
    members: Member[];
    teams: ProjectTeam[];
}

export async function fetchTeamData(projectId: string, token: string): Promise<TeamData> {
    const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/projetos/${projectId}/membros`,
        { headers: { Authorization: `Bearer ${token}` } },
    );
    if (!res.ok) return { members: [], teams: [] };
    const data: ApiMember[] = await res.json();
    const members: Member[] = data.map(m => ({
        id: m.usuario.id,
        name: m.usuario.nome,
        initials: toInitials(m.usuario.nome),
        role: mapRole(m.papel),
        teamId: null,
    }));
    return { members, teams: [] };
}

export function groupMembers(members: Member[], teams: ProjectTeam[]): TeamGroupData[] {
    const groups: TeamGroupData[] = [];

    if (members.length > 0) {
        groups.push({ id: 'all', label: 'Todos os integrantes', members, isUnassigned: true });
    }

    const unassigned = members.filter(m => m.teamId === null);
    if (unassigned.length > 0) {
        groups.push({ id: 'unassigned', label: 'Sem equipe', members: unassigned, isUnassigned: true });
    }

    for (const team of teams) {
        groups.push({
            id: `team-${team.id}`,
            label: team.name,
            members: members.filter(m => m.teamId === team.id),
        });
    }

    return groups;
}
