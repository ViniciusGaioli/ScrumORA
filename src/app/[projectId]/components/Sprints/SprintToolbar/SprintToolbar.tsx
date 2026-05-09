"use client";

import { useState } from 'react';
import styles from './SprintToolbar.module.css';
import { CreateSprintModal } from '../CreateSprintModal/CreateSprintModal';
import { Activity } from '../../Kanban/ActivityCard/Activity';

interface SprintToolbarProps {
    projectId: string;
    canEdit?: boolean;
    activities: Activity[];
    onCreated: () => void;
}

export function SprintToolbar({ projectId, canEdit = false, activities, onCreated }: SprintToolbarProps) {
    const [open, setOpen] = useState(false);

    if (!canEdit) return null;

    return (
        <>
            <div className={styles.toolbar}>
                <button className={styles.btn} onClick={() => setOpen(true)}>
                    Criar Sprint
                </button>
            </div>
            {open && (
                <CreateSprintModal
                    projectId={projectId}
                    activities={activities}
                    onClose={() => setOpen(false)}
                    onCreated={onCreated}
                />
            )}
        </>
    );
}
