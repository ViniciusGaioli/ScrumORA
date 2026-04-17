import styles from './page.module.css';
import { MembersToolbar } from './MembersToolbar';
import { MemberCard } from '../components/Team/MemberCard/MemberCard';
import { fetchTeamData } from '../services/teamService';
import { fetchUserRole } from '../services/projectService';
import { UserRole } from '@/src/types/project';

function canUserEdit(role: UserRole): boolean {
    return role === 'scrum_master' || role === 'product_owner';
}

export default async function MembersPage({
    params,
}: {
    params: Promise<{ projectId: string }>;
}) {
    const { projectId } = await params;

    const [{ members }, userRole] = await Promise.all([
        fetchTeamData(projectId),
        fetchUserRole(projectId),
    ]);

    const canEdit = canUserEdit(userRole);

    return (
        <div className={styles.page}>
            <main className={styles.main}>
                <MembersToolbar canEdit={canEdit} />
                {members.length === 0 ? (
                    <p className={styles.empty}>Nenhum integrante encontrado.</p>
                ) : (
                    <div className={styles.grid}>
                        {members.map(member => (
                            <MemberCard
                                key={member.id}
                                member={member}
                                canEdit={canEdit}
                            />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
