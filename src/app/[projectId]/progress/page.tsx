import styles from './page.module.css';
import { GeneralVision } from '../components/Progress/GeneralVision/GeneralVision';
import { StatusDistribution } from '../components/Progress/StatusDistribution/StatusDistribution';
import { SprintProgress } from '../components/Progress/SprintProgress/SprintProgress';
import { fetchActivities } from '../services/activityService';
import { fetchTeamData } from '../services/teamService';
import { Activity } from '../components/Kanban/ActivityCard/Activity';

interface CurrentSprint {
    id: number;
    name: string;
    endDate?: string;
}

function resolveCurrentSprint(activities: Activity[]): CurrentSprint | undefined {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const sprints = new Map<number, { name: string; startDate?: string; endDate?: string }>();
    for (const a of activities) {
        if (!a.sprint) continue;
        if (!sprints.has(a.sprint.id)) {
            sprints.set(a.sprint.id, {
                name: a.sprint.name,
                startDate: a.sprint.startDate,
                endDate: a.sprint.endDate,
            });
        }
    }

    const entries = Array.from(sprints.entries()).sort((a, b) => a[0] - b[0]);
    const ongoing = entries.find(([, s]) => {
        if (!s.startDate || !s.endDate) return false;
        const start = new Date(s.startDate);
        const end = new Date(s.endDate);
        return start <= now && now <= end;
    });
    const target = ongoing ?? entries[entries.length - 1];
    if (!target) return undefined;
    const [id, data] = target;
    return { id, name: data.name, endDate: data.endDate };
}

export default async function ProgressPage({
    params,
}: {
    params: Promise<{ projectId: string }>;
}) {
    const { projectId } = await params;

    const [activities, teamData] = await Promise.all([
        fetchActivities(projectId),
        fetchTeamData(projectId),
    ]);

    const currentSprint = resolveCurrentSprint(activities);

    return (
        <div className={styles.page}>
            <main className={styles.main}>
                <div className={styles.list}>
                    <GeneralVision activities={activities} currentSprint={currentSprint} />
                    <StatusDistribution activities={activities} />
                    <SprintProgress activities={activities} teams={teamData.teams} />
                </div>
            </main>
        </div>
    );
}
