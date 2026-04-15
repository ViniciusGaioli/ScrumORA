export type ActivityStatus = | 'backlog' | 'development' | 'impediment' | 'approval' | 'done';

export interface ActivityResponsible {
    user?: { id: number; name: string; initials: string; };
    team?: { id: number; name: string; };
}

export interface ActivitySprint {
    id: number;
    name: string;
}

export interface Activity {
    id: number;
    name: string;
    description: string;
    status: ActivityStatus;
    startDate: string;
    endDate: string;
    archived: boolean;
    sprint?: ActivitySprint;
    responsibles: ActivityResponsible[];
}