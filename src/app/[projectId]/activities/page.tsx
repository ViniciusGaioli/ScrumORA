"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import styles from "./Page.module.css";
import { GroupBy } from "../components/GroupBy/GroupBy";
import { KanbanBoardClient } from "../components/Kanban/KanbanBoard/KanbanBoardClient";
import { fetchActivities, updateActivityStatus, updateActivitySprint, addActivityTeam, removeActivityResponsible, fetchActivityResponsibles, fetchSprints, ApiSprintInfo } from "../services/activityService";
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
    const [sprints, setSprints] = useState<ApiSprintInfo[]>([]);
    const [boardKey, setBoardKey] = useState(0);

    function loadActivities(token: string) {
        fetchActivities(projectId, token).then(acts => {
            setActivities(acts);
            setBoardKey(k => k + 1);
        });
        fetchSprints(projectId, token).then(setSprints);
    }

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (!token) return;
        Promise.all([
            fetchActivities(projectId, token),
            fetchUserRole(projectId, token),
            fetchTeamData(projectId, token),
            fetchSprints(projectId, token),
        ]).then(([acts, role, teamData, sprintList]) => {
            setActivities(acts);
            setBoardKey(k => k + 1);
            setUserRole(role);
            setMembers(teamData.members);
            setTeams(teamData.teams);
            setSprints(sprintList);
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

    async function handleGroupChange(activityId: number, oldGroupId: string, newGroupId: string) {
        const token = localStorage.getItem('accessToken');
        if (!token) return;

        setActivities(prev => prev.map(a => {
            if (a.id !== activityId) return a;
            if (groupBy === 'sprint') {
                if (newGroupId === 'none') return { ...a, sprint: undefined };
                const sprintId = Number(newGroupId);
                if (Number.isNaN(sprintId)) return a;
                const info = sprints.find(s => s.id === sprintId);
                return { ...a, sprint: info ? { id: info.id, name: info.nome } : { id: sprintId, name: '' } };
            }
            const oldTeamId = oldGroupId === 'none' ? null : Number(oldGroupId);
            const newTeamId = newGroupId === 'none' ? null : Number(newGroupId);
            let resp = a.responsibles;
            if (oldTeamId !== null) {
                resp = resp.filter(r => !(r.team && r.team.id === oldTeamId));
            }
            if (newTeamId !== null && !resp.some(r => r.team && r.team.id === newTeamId)) {
                const team = teams.find(t => t.id === newTeamId);
                resp = [...resp, { team: { id: newTeamId, name: team?.name ?? '' } }];
            }
            return { ...a, responsibles: resp };
        }));

        try {
            if (groupBy === 'sprint') {
                const newSprintId = newGroupId === 'none' ? null : Number(newGroupId);
                const ok = await updateActivitySprint(projectId, activityId, newSprintId, null, token);
                if (!ok) loadActivities(token);
            } else {
                const oldTeamId = oldGroupId === 'none' ? null : Number(oldGroupId);
                const newTeamId = newGroupId === 'none' ? null : Number(newGroupId);

                let removeOk = true;
                if (oldTeamId !== null) {
                    const ars = await fetchActivityResponsibles(activityId, token);
                    const arToDelete = ars.find(ar => ar.teamId === oldTeamId);
                    if (arToDelete) {
                        removeOk = await removeActivityResponsible(arToDelete.id, token);
                    }
                }
                let addOk = true;
                if (newTeamId !== null) {
                    addOk = await addActivityTeam(activityId, newTeamId, token);
                }
                if (!removeOk || !addOk) loadActivities(token);
            }
        } catch {
            loadActivities(token);
        }
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
                    sprints={sprints}
                    canEdit={canUserEdit(userRole)}
                    onCreated={handleCreated}
                    onStatusChange={handleStatusChange}
                    onGroupChange={handleGroupChange}
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
