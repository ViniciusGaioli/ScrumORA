"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import styles from './page.module.css';
import { MembersToolbar } from './MembersToolbar';
import { MemberCard, MemberMenuAction } from '../components/Team/MemberCard/MemberCard';
import { EditMemberModal } from '../components/Team/EditMemberModal/EditMemberModal';
import { fetchTeamData } from '../services/teamService';
import { fetchUserRole } from '../services/projectService';
import { Member } from '../components/Team/MemberCard/Member';
import { UserRole } from '@/src/types/project';

function canUserEdit(role: UserRole): boolean {
    return role === 'scrum_master' || role === 'product_owner';
}

export default function MembersPage() {
    const { projectId } = useParams<{ projectId: string }>();
    const [members, setMembers] = useState<Member[]>([]);
    const [userRole, setUserRole] = useState<UserRole>('member');
    const [editTarget, setEditTarget] = useState<{ member: Member; tab: 'edit' | 'remove' } | null>(null);

    function load() {
        const token = localStorage.getItem('accessToken');
        if (!token) return;
        Promise.all([
            fetchTeamData(projectId, token),
            fetchUserRole(projectId, token),
        ]).then(([teamData, role]) => {
            setMembers(teamData.members);
            setUserRole(role);
        });
    }

    useEffect(() => { load(); }, [projectId]);

    const canEdit = canUserEdit(userRole);

    function handleAction(member: Member, action: MemberMenuAction) {
        setEditTarget({ member, tab: action === 'remove' ? 'remove' : 'edit' });
    }

    return (
        <div className={styles.page}>
            <main className={styles.main}>
                <MembersToolbar projectId={projectId} canEdit={canEdit} />
                {members.length === 0 ? (
                    <p className={styles.empty}>Nenhum integrante encontrado.</p>
                ) : (
                    <div className={styles.grid}>
                        {members.map(member => (
                            <MemberCard
                                key={member.id}
                                member={member}
                                canEdit={canEdit}
                                onActionClick={handleAction}
                            />
                        ))}
                    </div>
                )}
            </main>

            {editTarget && (
                <EditMemberModal
                    member={editTarget.member}
                    projectId={projectId}
                    initialTab={editTarget.tab}
                    onClose={() => setEditTarget(null)}
                    onSaved={load}
                />
            )}
        </div>
    );
}
