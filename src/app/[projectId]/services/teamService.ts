import { Member, ProjectTeam } from '../components/Team/MemberCard/Member';
import { TeamGroupData } from '../components/Team/TeamGroup/TeamGroup';

const MOCK_TEAMS: ProjectTeam[] = [
    { id: 1, name: 'Backend' },
    { id: 2, name: 'Frontend' },
];

const MOCK_MEMBERS: Member[] = [
    { id: 1, name: 'Vinicius Gaioli',  initials: 'VG', role: 'scrum_master',  teamId: null },
    { id: 2, name: 'Julia Matos',      initials: 'JM', role: 'product_owner', teamId: null },
    { id: 3, name: 'Carlos Silva',     initials: 'CS', role: 'member',        teamId: 1    },
    { id: 4, name: 'Ana Lima',         initials: 'AL', role: 'member',        teamId: 1    },
    { id: 5, name: 'Rafael Alves',     initials: 'RA', role: 'member',        teamId: 2    },
    { id: 6, name: 'Pedro Costa',      initials: 'PC', role: 'member',        teamId: 2    },
];

export interface TeamData {
    members: Member[];
    teams: ProjectTeam[];
}

export async function fetchTeamData(_projectId: string): Promise<TeamData> {
    return { members: MOCK_MEMBERS, teams: MOCK_TEAMS };
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
