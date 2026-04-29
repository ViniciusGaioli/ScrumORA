"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import styles from "./Page.module.css";
import { GroupBy } from "../components/GroupBy/GroupBy";
import { KanbanBoardClient } from "../components/Kanban/KanbanBoard/KanbanBoardClient";
import { groupActivities } from "../components/Kanban/KanbanBoard/groupActivities";
import { fetchActivities } from "../services/activityService";
import { fetchUserRole } from "../services/projectService";
import { fetchTeamData } from "../services/teamService";
import { Activity } from "../components/Kanban/ActivityCard/Activity";
import { Member } from "../components/Team/MemberCard/Member";
import { UserRole } from "@/src/types/project";

const GROUP_OPTIONS = [
    { value: 'team',   label: 'Por equipe' },
    { value: 'sprint', label: 'Por sprint' },
];

function canUserEdit(role: UserRole): boolean {
    return role === 'scrum_master' || role === 'product_owner';
}

export default function ActivitiesPage() {
    const { projectId } = useParams<{ projectId: string }>();
    const searchParams = useSearchParams();
    const groupBy = (searchParams.get('group') ?? 'team') as 'team' | 'sprint';

    const [activities, setActivities] = useState<Activity[]>([]);
    const [userRole, setUserRole] = useState<UserRole>('member');
    const [members, setMembers] = useState<Member[]>([]);

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (!token) return;

        Promise.all([
            fetchActivities(projectId, token),
            fetchUserRole(projectId, token),
            fetchTeamData(projectId, token),
        ]).then(([acts, role, teamData]) => {
            setActivities(acts);
            setUserRole(role);
            setMembers(teamData.members);
        });
    }, [projectId]);

    const groups = groupActivities(activities, groupBy);

    return (
        <div className={styles.page}>
            <main className={styles.main}>
                <div className={styles.toolbar}>
                    <GroupBy options={GROUP_OPTIONS} paramKey="group" defaultValue="team" />
                </div>
                <KanbanBoardClient
                    groups={groups}
                    members={members}
                    canEdit={canUserEdit(userRole)}
                />
            </main>
        </div>
    );
}
