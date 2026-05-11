"use client";

import { useCallback, useMemo } from 'react';
import styles from './KanbanGroup.module.css';
import { KanbanColumn } from '../KanbanColumn/KanbanColumn';
import { Activity, ActivityStatus } from '../ActivityCard/Activity';
import { ActivityMenuAction } from '../ActivityCard/ActivityCard';

const STATUSES: ActivityStatus[] = ['backlog', 'development', 'impediment', 'approval', 'done'];

export interface KanbanGroupData {
    id: string;
    label: string;
    activities: Activity[];
}

interface KanbanGroupProps {
    group: KanbanGroupData;
    canEdit?: boolean;
    onActivityMenuClick?: (activity: Activity, action: ActivityMenuAction) => void;
    onAddActivity?: (status: ActivityStatus, groupId: string) => void;
}

export function KanbanGroup({ group, canEdit = false, onActivityMenuClick, onAddActivity }: KanbanGroupProps) {
    const byStatus = useMemo(() => {
        const map: Record<ActivityStatus, Activity[]> = {
            backlog: [], development: [], impediment: [], approval: [], done: [],
        };
        for (const a of group.activities) map[a.status].push(a);
        return map;
    }, [group.activities]);

    const groupId = group.id;
    const handleAdd = useCallback((s: ActivityStatus) => {
        onAddActivity?.(s, groupId);
    }, [onAddActivity, groupId]);

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
                        groupId={groupId}
                        status={status}
                        activities={byStatus[status]}
                        canEdit={canEdit}
                        onActivityMenuClick={onActivityMenuClick}
                        onAddActivity={handleAdd}
                    />
                ))}
            </div>
        </div>
    );
}
