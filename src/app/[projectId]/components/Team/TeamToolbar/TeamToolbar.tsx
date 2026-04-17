"use client";

import { useState } from 'react';
import styles from './TeamToolbar.module.css';
import { CreateTeamModal } from '../CreateTeamModal/CreateTeamModal';
import { Member } from '../MemberCard/Member';

interface TeamToolbarProps {
    canEdit?: boolean;
    members: Member[];
}

export function TeamToolbar({ canEdit = false, members }: TeamToolbarProps) {
    const [open, setOpen] = useState(false);

    if (!canEdit) return null;

    return (
        <>
            <div className={styles.toolbar}>
                <button className={styles.btn} onClick={() => setOpen(true)}>
                    Criar nova equipe
                </button>
            </div>
            {open && <CreateTeamModal members={members} onClose={() => setOpen(false)} />}
        </>
    );
}
