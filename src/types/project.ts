export type UserRole = 'scrum_master' | 'product_owner' | 'member';

export interface Member {
    id: string;
    name: string;
    initials: string;
}

export interface Sprint {
    id: string;
    name: string;
    status: boolean;
}

export interface Project {
    id: string;
    name: string;
    description: string;
    role: UserRole;
    progress: number;
    members: Member[];
    activeSprint?: Sprint;
}
