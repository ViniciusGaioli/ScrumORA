"use client";

import styles from './KanbanColumn.module.css';
import { ActivityCard } from '../ActivityCard/ActivityCard';
import { Activity, ActivityStatus } from '../ActivityCard/Activity';

const IconPlus = () => (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19"/>
        <line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
);

const STATUS_CONFIG: Record<ActivityStatus, { label: string; color: string; }> = {
    backlog:     { label: 'Backlog',          color: 'var(--color-status-backlog)'     },
    development: { label: 'Desenvolvimento',  color: 'var(--color-status-development)' },
    impediment:  { label: 'Impedimento',      color: 'var(--color-status-impediment)'  },
    approval:    { label: 'Aprovação',        color: 'var(--color-status-approval)'    },
    done:        { label: 'Finalizada',       color: 'var(--color-status-done)'        },
};

interface KanbanColumnProps {
    status: ActivityStatus;
    activities: Activity[];
    canEdit?: boolean;
    onActivityClick?: (activity: Activity) => void;
    onActivityMenuClick?: (activity: Activity) => void;
    onAddActivity?: (status: ActivityStatus) => void;
}

export function KanbanColumn({
    status,
    activities,
    canEdit = false,
    onActivityClick,
    onActivityMenuClick,
    onAddActivity,
}: KanbanColumnProps) {
    const config = STATUS_CONFIG[status];

    return (
        <div className={styles.column}>
            <div className={styles.header}>
                <div className={styles.dot} style={{ background: config.color }} />
                <span className={styles.title}>{config.label}</span>
                <span className={styles.count}>{activities.length}</span>
            </div>

            <div className={styles.cards}>
                {activities.map(activity => (
                    <ActivityCard
                        key={activity.id}
                        activity={activity}
                        canEdit={canEdit}
                        onClick={onActivityClick}
                        onMenuClick={onActivityMenuClick}
                    />
                ))}

                {canEdit && (
                    <button
                        className={styles.addBtn}
                        onClick={() => onAddActivity?.(status)}
                    >
                        <IconPlus />
                        Adicionar
                    </button>
                )}
            </div>
        </div>
    );
}
