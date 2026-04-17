export type MemberRole = 'scrum_master' | 'product_owner' | 'member';

export interface Member {
    id: number;
    name: string;
    initials: string;
    role: MemberRole;
    teamId: number | null;
}

export interface ProjectTeam {
    id: number;
    name: string;
}
