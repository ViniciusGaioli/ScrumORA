"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import styles from './page.module.css';
import { TeamBoardClient } from '../components/Team/TeamBoard/TeamBoardClient';
import { TeamToolbar } from '../components/Team/TeamToolbar/TeamToolbar';
import { fetchTeamData } from '../services/teamService';
import { fetchUserRole } from '../services/projectService';
import { Member, ProjectTeam } from '../components/Team/MemberCard/Member';
import { UserRole } from '@/src/types/project';

function canUserEdit(role: UserRole): boolean {
    return role === 'scrum_master' || role === 'product_owner';
}

export default function TeamPage() {
    const { projectId } = useParams<{ projectId: string }>();
    const [members, setMembers] = useState<Member[]>([]);
    const [teams, setTeams] = useState<ProjectTeam[]>([]);
    const [userRole, setUserRole] = useState<UserRole>('member');

    function load() {
        const token = localStorage.getItem('accessToken');
        if (!token) return;
        Promise.all([
            fetchTeamData(projectId, token),
            fetchUserRole(projectId, token),
        ]).then(([teamData, role]) => {
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
                <TeamToolbar
                    projectId={projectId}
                    canEdit={canEdit}
                    members={members}
                    onCreated={load}
                />
                <TeamBoardClient
                    members={members}
                    teams={teams}
                    canEdit={canEdit}
                    projectId={projectId}
                    onRefresh={load}
                />
            </main>
        </div>
    );
}
