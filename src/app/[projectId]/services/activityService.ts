import { Activity, ActivityResponsible, ActivityStatus } from "../components/Kanban/ActivityCard/Activity";

type ApiResponsavel = {
    usuario?: { id: number; nome: string } | null;
    equipe?: { id: number; nome: string } | null;
};

type ApiActivity = {
    id: number;
    nome: string;
    descricao: string;
    etapa: string;
    dataInicio: string;
    dataFim: string;
    arquivada: boolean;
    sprint?: { id: number; nome: string };
    responsaveis: ApiResponsavel[];
};

const ETAPA_MAP: Record<string, ActivityStatus> = {
    backlog:        'backlog',
    desenvolvimento: 'development',
    impedimento:    'impediment',
    aprovacao:      'approval',
    finalizada:     'done',
};

function toInitials(nome: string): string {
    const words = nome.trim().split(/\s+/);
    return (words[0][0] + (words[1]?.[0] ?? '')).toUpperCase();
}

function mapActivity(a: ApiActivity): Activity {
    return {
        id: a.id,
        name: a.nome,
        description: a.descricao,
        status: ETAPA_MAP[a.etapa] ?? 'backlog',
        startDate: a.dataInicio,
        endDate: a.dataFim,
        archived: a.arquivada,
        sprint: a.sprint ? { id: a.sprint.id, name: a.sprint.nome } : undefined,
        responsibles: (a.responsaveis ?? []).map((r): ActivityResponsible | null => {
            if (r.usuario) {
                return {
                    user: {
                        id: r.usuario.id,
                        name: r.usuario.nome,
                        initials: toInitials(r.usuario.nome),
                    },
                };
            }
            if (r.equipe) {
                return {
                    team: { id: r.equipe.id, name: r.equipe.nome },
                };
            }
            return null;
        }).filter((r): r is ActivityResponsible => r !== null),
    };
}

export interface ApiSprintInfo {
    id: number;
    nome: string;
    dataInicio: string;
    dataFim: string;
    status: string;
}

export async function fetchSprints(projectId: string, token: string): Promise<ApiSprintInfo[]> {
    const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/projetos/${projectId}/sprints`,
        { headers: { Authorization: `Bearer ${token}` } },
    );
    if (!res.ok) return [];
    return res.json();
}

export async function fetchActivities(projectId: string, token: string): Promise<Activity[]> {
    const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/projetos/${projectId}/atividades`,
        { headers: { Authorization: `Bearer ${token}` } },
    );
    if (!res.ok) return [];
    const data: ApiActivity[] = await res.json();
    return data.map(mapActivity);
}

const STATUS_TO_ETAPA: Record<ActivityStatus, string> = {
    backlog:     'backlog',
    development: 'desenvolvimento',
    impediment:  'impedimento',
    approval:    'aprovacao',
    done:        'finalizada',
};

export async function updateActivityStatus(
    projectId: string,
    activityId: number,
    newStatus: ActivityStatus,
    token: string,
): Promise<boolean> {
    const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/projetos/${projectId}/atividades/${activityId}`,
        {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ etapa: STATUS_TO_ETAPA[newStatus] }),
        },
    );
    return res.ok;
}

export async function updateActivitySprint(
    projectId: string,
    activityId: number,
    sprintId: number | null,
    status: ActivityStatus | null,
    token: string,
): Promise<boolean> {
    const body: Record<string, unknown> = { sprintId };
    if (status !== null) body.etapa = STATUS_TO_ETAPA[status];
    const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/projetos/${projectId}/atividades/${activityId}`,
        {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify(body),
        },
    );
    return res.ok;
}

export async function fetchActivityResponsibles(
    activityId: number,
    token: string,
): Promise<Array<{ id: number; userId?: number; teamId?: number }>> {
    const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/atividade-responsavel?atividadeId=${activityId}`,
        { headers: { Authorization: `Bearer ${token}` } },
    );
    if (!res.ok) return [];
    const data: Array<{ id: number; usuario?: { id: number } | null; equipe?: { id: number } | null }> = await res.json();
    return data.map(r => ({
        id: r.id,
        userId: r.usuario?.id,
        teamId: r.equipe?.id,
    }));
}
