import styles from './page.module.css';
import { TeamBoard } from '../components/Team/TeamBoard/TeamBoard';
import { TeamToolbar } from '../components/Team/TeamToolbar/TeamToolbar';
import { fetchTeamData, groupMembers } from '../services/teamService';
import { fetchUserRole } from '../services/projectService';
import { UserRole } from '@/src/types/project';

function canUserEdit(role: UserRole): boolean {
    return role === 'scrum_master' || role === 'product_owner';
}

export default async function TeamPage({
    params,
}: {
    params: Promise<{ projectId: string }>;
}) {
    const { projectId } = await params;

    const [{ members, teams }, userRole] = await Promise.all([
        fetchTeamData(projectId),
        fetchUserRole(projectId),
    ]);

    const canEdit = canUserEdit(userRole);
    const groups = groupMembers(members, teams);

    return (
        <div className={styles.page}>
            <main className={styles.main}>
                <TeamToolbar canEdit={canEdit} members={members} />
                <TeamBoard groups={groups} canEdit={canEdit} />
            </main>
        </div>
    );
}
