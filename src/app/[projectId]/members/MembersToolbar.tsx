"use client";

import { useState } from 'react';
import styles from './MembersToolbar.module.css';
import { InviteMemberModal } from '../components/Team/InviteMemberModal/InviteMemberModal';

interface MembersToolbarProps {
    projectId: string;
    canEdit?: boolean;
}

export function MembersToolbar({ projectId, canEdit = false }: MembersToolbarProps) {
    const [open, setOpen] = useState(false);

    if (!canEdit) return null;

    return (
        <>
            <div className={styles.toolbar}>
                <button className={styles.btn} onClick={() => setOpen(true)}>
                    Convidar novo integrante ao projeto
                </button>
            </div>
            {open && <InviteMemberModal projectId={projectId} onClose={() => setOpen(false)} />}
        </>
    );
}
