import styles from './page.module.css';
import { SprintCard, SprintGroupData } from '../components/Sprints/SprintCard/SprintCard';
import { SprintToolbar } from '../components/Sprints/SprintToolbar/SprintToolbar';
import { fetchActivities } from '../services/activityService';
import { fetchUserRole } from '../services/projectService';
import { Activity } from '../components/Kanban/ActivityCard/Activity';
import { UserRole } from '@/src/types/project';

function canUserEdit(role: UserRole): boolean {
    return role === 'scrum_master' || role === 'product_owner';
}

function groupBySprint(activities: Activity[]): SprintGroupData[] {
    const map = new Map<number, SprintGroupData>();
    for (const activity of activities) {
        if (!activity.sprint) continue;
        const { id, name, description } = activity.sprint;
        const existing = map.get(id);
        if (existing) {
            existing.activities.push(activity);
        } else {
            map.set(id, { id, name, description, activities: [activity] });
        }
    }
    return Array.from(map.values()).sort((a, b) => a.id - b.id);
}

export default async function SprintsPage({
    params,
}: {
    params: Promise<{ projectId: string }>;
}) {
    const { projectId } = await params;

    const [activities, userRole] = await Promise.all([
        fetchActivities(projectId),
        fetchUserRole(projectId),
    ]);

    const sprints = groupBySprint(activities);
    const canEdit = canUserEdit(userRole);

    return (
        <div className={styles.page}>
            <main className={styles.main}>
                <SprintToolbar canEdit={canEdit} activities={activities} />
                {sprints.length === 0 ? (
                    <p className={styles.empty}>Nenhuma sprint encontrada.</p>
                ) : (
                    <div className={styles.list}>
                        {sprints.map(sprint => (
                            <SprintCard key={sprint.id} sprint={sprint} allActivities={activities} canEdit={canEdit} />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
