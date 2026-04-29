import { Activity, ActivityStatus } from "../components/Kanban/ActivityCard/Activity";

type ApiResponsavel = {
    usuario: { id: number; nome: string };
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
        responsibles: (a.responsaveis ?? []).map(r => ({
            user: {
                id: r.usuario.id,
                name: r.usuario.nome,
                initials: toInitials(r.usuario.nome),
            },
        })),
    };
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
