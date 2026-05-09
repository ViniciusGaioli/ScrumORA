import { Member, ProjectTeam } from '../components/Team/MemberCard/Member';
import { TeamGroupData } from '../components/Team/TeamGroup/TeamGroup';

type ApiMember = {
    usuario: { id: number; nome: string };
    papel: string;
};

type ApiTeam = {
    id: number;
    nome: string;
    usuarios?: { id: number }[];
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
    const [membersRes, teamsRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/projetos/${projectId}/membros`, {
            headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/projetos/${projectId}/equipes`, {
            headers: { Authorization: `Bearer ${token}` },
        }),
    ]);

    const membersData: ApiMember[] = membersRes.ok ? await membersRes.json() : [];
    const teamsData: ApiTeam[] = teamsRes.ok ? await teamsRes.json() : [];

    const teams: ProjectTeam[] = teamsData.map(t => ({ id: t.id, name: t.nome }));

    const members: Member[] = membersData.map(m => {
        const team = teamsData.find(t => t.usuarios?.some(u => u.id === m.usuario.id));
        return {
            id: m.usuario.id,
            name: m.usuario.nome,
            initials: toInitials(m.usuario.nome),
            role: mapRole(m.papel),
            teamId: team?.id ?? null,
        };
    });

    return { members, teams };
}

export function groupMembers(members: Member[], teams: ProjectTeam[]): TeamGroupData[] {
    const groups: TeamGroupData[] = [];

    groups.push({ id: 'all', label: 'Todos os integrantes', members, isUnassigned: true });

    for (const team of teams) {
        groups.push({
            id: `team-${team.id}`,
            label: team.name,
            members: members.filter(m => m.teamId === team.id),
        });
    }

    const unassigned = members.filter(m => m.teamId === null);
    if (unassigned.length > 0 && teams.length > 0) {
        groups.push({ id: 'unassigned', label: 'Sem equipe', members: unassigned, isUnassigned: true });
    }

    return groups;
}
