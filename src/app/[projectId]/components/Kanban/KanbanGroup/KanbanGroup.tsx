"use client";

import styles from './KanbanGroup.module.css';
import { KanbanColumn } from '../KanbanColumn/KanbanColumn';
import { Activity, ActivityStatus } from '../ActivityCard/Activity';

const STATUSES: ActivityStatus[] = [
    'backlog',
    'development',
    'impediment',
    'approval',
    'done',
];

export interface KanbanGroupData {
    id: string;
    label: string;
    activities: Activity[];
}

interface KanbanGroupProps {
    group: KanbanGroupData;
    canEdit?: boolean;
    onActivityClick?: (activity: Activity) => void;
    onActivityMenuClick?: (activity: Activity) => void;
    onAddActivity?: (status: ActivityStatus, groupId: string) => void;
}

export function KanbanGroup({
    group,
    canEdit = false,
    onActivityClick,
    onActivityMenuClick,
    onAddActivity,
}: KanbanGroupProps) {
    return (
        <div className={styles.group}>
        <div className={styles.header}>
            <span className={styles.label}>{group.label}</span>
            <span className={styles.count}>{group.activities.length}</span>
            <div className={styles.divider} />
        </div>

        <div className={styles.board}>
            {STATUSES.map(status => (
            <KanbanColumn
                key={status}
                status={status}
                activities={group.activities.filter(a => a.status === status)}
                canEdit={canEdit}
                onActivityClick={onActivityClick}
                onActivityMenuClick={onActivityMenuClick}
                onAddActivity={(s) => onAddActivity?.(s, group.id)}
            />
            ))}
        </div>
        </div>
    );
}