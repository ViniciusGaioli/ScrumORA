"use client";

import { useState } from 'react';
import styles from './SprintToolbar.module.css';
import { CreateSprintModal } from '../CreateSprintModal/CreateSprintModal';
import { Activity } from '../../Kanban/ActivityCard/Activity';

interface SprintToolbarProps {
    canEdit?: boolean;
    activities: Activity[];
}

export function SprintToolbar({ canEdit = false, activities }: SprintToolbarProps) {
    const [open, setOpen] = useState(false);

    if (!canEdit) return null;

    return (
        <>
            <div className={styles.toolbar}>
                <button className={styles.btn} onClick={() => setOpen(true)}>
                    Criar Sprint
                </button>
            </div>
            {open && <CreateSprintModal activities={activities} onClose={() => setOpen(false)} />}
        </>
    );
}
