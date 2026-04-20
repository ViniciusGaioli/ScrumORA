import { Activity } from "../components/Kanban/ActivityCard/Activity";

const MOCK_ACTIVITIES: Activity[] = [
    {
        id: 1,
        name: 'Configurar autenticação JWT',
        description: 'Implementar geração, validação e renovação de tokens JWT para as rotas protegidas da API.',
        status: 'done',
        startDate: '2025-03-01',
        endDate: '2025-03-10',
        archived: false,
        sprint: { id: 1, name: 'Autenticação e onboarding', description: 'Entregar o fluxo completo de login, cadastro e recuperação de senha para liberar o acesso ao MVP.', startDate: '2026-03-01', endDate: '2026-03-15' },
        responsibles: [
            { user: { id: 1, name: 'Vinicius Gaioli', initials: 'VG' } },
            { team: { id: 1, name: 'Backend' } },
        ],
    },
    {
        id: 2,
        name: 'Criar tela de login',
        description: 'Desenvolver a interface de login com validação de campos, feedback de erro e redirecionamento pós-autenticação.',
        status: 'done',
        startDate: '2025-03-05',
        endDate: '2025-03-15',
        archived: false,
        sprint: { id: 1, name: 'Autenticação e onboarding', description: 'Entregar o fluxo completo de login, cadastro e recuperação de senha para liberar o acesso ao MVP.', startDate: '2026-03-01', endDate: '2026-03-15' },
        responsibles: [
            { user: { id: 2, name: 'Rafael Alves', initials: 'RA' } },
            { team: { id: 2, name: 'Frontend' } },
        ],
    },
    {
        id: 3,
        name: 'Modelagem do banco de dados',
        description: 'Definir esquema de tabelas, relacionamentos, índices e migrations iniciais para o banco PostgreSQL.',
        status: 'development',
        startDate: '2025-03-10',
        endDate: '2025-04-20',
        archived: false,
        sprint: { id: 2, name: 'Núcleo do produto', description: 'Construir a base de dados, integrações críticas e o painel de métricas iniciais do produto.', startDate: '2026-03-16', endDate: '2026-04-15' },
        responsibles: [
            { team: { id: 1, name: 'Backend' } },
        ],
    },
    {
        id: 4,
        name: 'Integração com API de pagamentos',
        description: 'Conectar ao gateway de pagamentos, tratar webhooks e garantir idempotência nas transações.',
        status: 'impediment',
        startDate: '2025-03-15',
        endDate: '2025-04-01',
        archived: false,
        sprint: { id: 2, name: 'Núcleo do produto', description: 'Construir a base de dados, integrações críticas e o painel de métricas iniciais do produto.', startDate: '2026-03-16', endDate: '2026-04-15' },
        responsibles: [
            { user: { id: 1, name: 'Vinicius Gaioli', initials: 'VG' } },
            { user: { id: 3, name: 'Julia Matos', initials: 'JM' } },
        ],
    },
    {
        id: 5,
        name: 'Dashboard de métricas',
        description: 'Criar painel com gráficos de velocidade, burndown e distribuição de tarefas por status.',
        status: 'approval',
        startDate: '2025-03-20',
        endDate: '2025-04-25',
        archived: false,
        sprint: { id: 2, name: 'Núcleo do produto', description: 'Construir a base de dados, integrações críticas e o painel de métricas iniciais do produto.', startDate: '2026-03-16', endDate: '2026-04-15' },
        responsibles: [
            { team: { id: 2, name: 'Frontend' } },
            { user: { id: 2, name: 'Rafael Alves', initials: 'RA' } },
        ],
    },
    {
        id: 6,
        name: 'Testes de integração',
        description: 'Escrever testes end-to-end cobrindo os principais fluxos de usuário entre frontend e backend.',
        status: 'backlog',
        startDate: '2025-04-01',
        endDate: '2025-05-10',
        archived: false,
        sprint: { id: 3, name: 'Qualidade e documentação', description: 'Cobrir os fluxos principais com testes de integração e documentar a API para consumidores externos.', startDate: '2026-04-16', endDate: '2026-05-05' },
        responsibles: [
            { team: { id: 1, name: 'Backend' } },
            { team: { id: 2, name: 'Frontend' } },
        ],
    },
    {
        id: 7,
        name: 'Documentação da API',
        description: 'Documentar todos os endpoints com Swagger, incluindo exemplos de requisição e resposta.',
        status: 'backlog',
        startDate: '2025-04-05',
        endDate: '2025-05-15',
        archived: false,
        sprint: { id: 3, name: 'Qualidade e documentação', description: 'Cobrir os fluxos principais com testes de integração e documentar a API para consumidores externos.', startDate: '2026-04-16', endDate: '2026-05-05' },
        responsibles: [
            { user: { id: 3, name: 'Julia Matos', initials: 'JM' } },
        ],
    },
    {
        id: 8,
        name: 'Refatorar módulo de notificações',
        description: 'Revisar a lógica de envio de notificações para suportar múltiplos canais e reduzir acoplamento.',
        status: 'development',
        startDate: '2025-04-10',
        endDate: '2025-05-01',
        archived: false,
        responsibles: [],
    },
];

export async function fetchActivities(_projectId: string): Promise<Activity[]> {
    return MOCK_ACTIVITIES;
}
