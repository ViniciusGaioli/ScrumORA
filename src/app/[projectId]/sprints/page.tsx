"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import styles from './page.module.css';
import { SprintMenuAction } from '../components/Sprints/SprintSection/SprintSection';
import { SprintsKanbanClient } from '../components/Sprints/SprintsKanban/SprintsKanbanClient';
import { SprintToolbar } from '../components/Sprints/SprintToolbar/SprintToolbar';
import { EditSprintModal } from '../components/Sprints/EditSprintModal/EditSprintModal';
import { fetchActivities, fetchSprints, ApiSprintInfo } from '../services/activityService';
import { fetchUserRole } from '../services/projectService';
import { fetchTeamData } from '../services/teamService';
import { Activity } from '../components/Kanban/ActivityCard/Activity';
import { Member, ProjectTeam } from '../components/Team/MemberCard/Member';
import { UserRole } from '@/src/types/project';

function canUserEdit(role: UserRole): boolean {
    return role === 'scrum_master' || role === 'product_owner';
}

export default function SprintsPage() {
    const { projectId } = useParams<{ projectId: string }>();
    const [sprints, setSprints] = useState<ApiSprintInfo[]>([]);
    const [activities, setActivities] = useState<Activity[]>([]);
    const [members, setMembers] = useState<Member[]>([]);
    const [teams, setTeams] = useState<ProjectTeam[]>([]);
    const [userRole, setUserRole] = useState<UserRole>('member');
    const [sprintTarget, setSprintTarget] = useState<{ sprint: ApiSprintInfo; tab: 'edit' | 'delete' } | null>(null);

    function handleSprintMenu(sprint: ApiSprintInfo, action: SprintMenuAction) {
        setSprintTarget({ sprint, tab: action });
    }

    function load() {
        const token = localStorage.getItem('accessToken');
        if (!token) return;
        Promise.all([
            fetchSprints(projectId, token),
            fetchActivities(projectId, token),
            fetchTeamData(projectId, token),
            fetchUserRole(projectId, token),
        ]).then(([sprintsData, activitiesData, teamData, role]) => {
            setSprints(sprintsData.sort((a, b) => a.id - b.id));
            setActivities(activitiesData);
            setMembers(teamData.members);
            setTeams(teamData.teams);
            setUserRole(role);
        });
    }

    useEffect(() => { load(); }, [projectId]);

    const canEdit = canUserEdit(userRole);

    return (
        <div className={styles.page}>
            <main className={styles.main}>
                <SprintToolbar
                    projectId={projectId}
                    canEdit={canEdit}
                    activities={activities}
                    onCreated={load}
                />
                {sprints.length === 0 ? (
                    <p className={styles.empty}>Nenhuma sprint encontrada. Crie a primeira sprint para começar.</p>
                ) : (
                    <div className={styles.list}>
                        <SprintsKanbanClient
                            sprints={sprints}
                            activities={activities}
                            members={members}
                            teams={teams}
                            canEdit={canEdit}
                            projectId={projectId}
                            onRefresh={load}
                            onSprintMenuClick={handleSprintMenu}
                        />
                    </div>
                )}
            </main>

            {sprintTarget && (
                <EditSprintModal
                    sprint={sprintTarget.sprint}
                    projectId={projectId}
                    initialTab={sprintTarget.tab}
                    onClose={() => setSprintTarget(null)}
                    onSaved={() => { load(); setSprintTarget(null); }}
                />
            )}
        </div>
    );
}
