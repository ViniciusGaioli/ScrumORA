import { Suspense } from "react";
import styles from "./Page.module.css";
import { GroupBy } from "../components/GroupBy/GroupBy";
import { KanbanBoardClient } from "../components/Kanban/KanbanBoard/KanbanBoardClient";
import { groupActivities } from "../components/Kanban/KanbanBoard/groupActivities";
import { fetchActivities } from "../services/activityService";
import { fetchUserRole } from "../services/projectService";
import { fetchTeamData } from "../services/teamService";
import { UserRole } from "@/src/types/project";

const GROUP_OPTIONS = [
    { value: 'team',   label: 'Por equipe' },
    { value: 'sprint', label: 'Por sprint' },
];

function canUserEdit(role: UserRole): boolean {
    return role === 'scrum_master' || role === 'product_owner';
}

export default async function ActivitiesPage({
    params,
    searchParams,
}: {
    params: Promise<{ projectId: string }>;
    searchParams: Promise<{ group?: string }>;
}) {
    const { projectId } = await params;
    const { group } = await searchParams;

    const groupBy = (group ?? 'team') as 'team' | 'sprint';
    const [activities, userRole, teamData] = await Promise.all([
        fetchActivities(projectId),
        fetchUserRole(projectId),
        fetchTeamData(projectId),
    ]);
    const groups = groupActivities(activities, groupBy);

    return (
        <div className={styles.page}>
            <main className={styles.main}>
                <div className={styles.toolbar}>
                    <Suspense>
                        <GroupBy options={GROUP_OPTIONS} paramKey="group" defaultValue="team" />
                    </Suspense>
                </div>
                <KanbanBoardClient
                    groups={groups}
                    members={teamData.members}
                    canEdit={canUserEdit(userRole)}
                />
            </main>
        </div>
    );
}
