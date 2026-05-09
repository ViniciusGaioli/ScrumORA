"use client";

import { useState } from 'react';
import styles from './TeamToolbar.module.css';
import { CreateTeamModal } from '../CreateTeamModal/CreateTeamModal';
import { Member } from '../MemberCard/Member';

interface TeamToolbarProps {
    projectId: string;
    canEdit?: boolean;
    members: Member[];
    onCreated: () => void;
}

export function TeamToolbar({ projectId, canEdit = false, members, onCreated }: TeamToolbarProps) {
    const [open, setOpen] = useState(false);

    if (!canEdit) return null;

    return (
        <>
            <div className={styles.toolbar}>
                <button className={styles.btn} onClick={() => setOpen(true)}>
                    Criar nova equipe
                </button>
            </div>
            {open && (
                <CreateTeamModal
                    projectId={projectId}
                    members={members}
                    onClose={() => setOpen(false)}
                    onCreated={onCreated}
                />
            )}
        </>
    );
}
