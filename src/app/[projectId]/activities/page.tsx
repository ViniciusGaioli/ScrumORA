"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import styles from "./Page.module.css";
import { GroupBy } from "../components/GroupBy/GroupBy";
import { KanbanBoardClient } from "../components/Kanban/KanbanBoard/KanbanBoardClient";
import { fetchActivities, updateActivityStatus } from "../services/activityService";
import { fetchUserRole } from "../services/projectService";
import { fetchTeamData } from "../services/teamService";
import { Activity, ActivityStatus } from "../components/Kanban/ActivityCard/Activity";
import { Member, ProjectTeam } from "../components/Team/MemberCard/Member";
import { UserRole } from "@/src/types/project";

const GROUP_OPTIONS = [
    { value: 'team',   label: 'Por equipe' },
    { value: 'sprint', label: 'Por sprint' },
];

function canUserEdit(role: UserRole): boolean {
    return role === 'scrum_master' || role === 'product_owner';
}

function ActivitiesContent() {
    const { projectId } = useParams<{ projectId: string }>();
    const searchParams = useSearchParams();
    const groupBy = (searchParams.get('group') ?? 'team') as 'team' | 'sprint';

    const [activities, setActivities] = useState<Activity[]>([]);
    const [userRole, setUserRole] = useState<UserRole>('member');
    const [members, setMembers] = useState<Member[]>([]);
    const [teams, setTeams] = useState<ProjectTeam[]>([]);
    const [boardKey, setBoardKey] = useState(0);

    function loadActivities(token: string) {
        fetchActivities(projectId, token).then(acts => {
            setActivities(acts);
            setBoardKey(k => k + 1);
        });
    }

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (!token) return;
        Promise.all([
            fetchActivities(projectId, token),
            fetchUserRole(projectId, token),
            fetchTeamData(projectId, token),
        ]).then(([acts, role, teamData]) => {
            setActivities(acts);
            setBoardKey(k => k + 1);
            setUserRole(role);
            setMembers(teamData.members);
            setTeams(teamData.teams);
        });
    }, [projectId]);

    function handleCreated() {
        const token = localStorage.getItem('accessToken');
        if (token) loadActivities(token);
    }

    function handleStatusChange(activityId: number, newStatus: ActivityStatus) {
        const token = localStorage.getItem('accessToken');
        if (!token) return;
        setActivities(prev => prev.map(a => a.id === activityId ? { ...a, status: newStatus } : a));
        updateActivityStatus(projectId, activityId, newStatus, token)
            .then(ok => { if (!ok) loadActivities(token); })
            .catch(() => loadActivities(token));
    }

    return (
        <div className={styles.page}>
            <main className={styles.main}>
                <div className={styles.toolbar}>
                    <GroupBy options={GROUP_OPTIONS} paramKey="group" defaultValue="team" />
                </div>
                <KanbanBoardClient
                    key={boardKey}
                    projectId={projectId}
                    activities={activities}
                    groupBy={groupBy}
                    members={members}
                    teams={teams}
                    canEdit={canUserEdit(userRole)}
                    onCreated={handleCreated}
                    onStatusChange={handleStatusChange}
                />
            </main>
        </div>
    );
}

export default function ActivitiesPage() {
    return (
        <Suspense>
            <ActivitiesContent />
        </Suspense>
    );
}
