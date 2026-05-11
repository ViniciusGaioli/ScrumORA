"use client";

import { memo, useMemo } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import styles from './KanbanColumn.module.css';
import { ActivityCard, ActivityMenuAction } from '../ActivityCard/ActivityCard';
import { Activity, ActivityStatus } from '../ActivityCard/Activity';
import PlusIcon from '@/src/assets/icons/PlusIcon/PlusIcon';

const STATUS_CONFIG: Record<ActivityStatus, { label: string; color: string; }> = {
    backlog:     { label: 'Backlog',          color: 'var(--color-status-backlog)'     },
    development: { label: 'Desenvolvimento',  color: 'var(--color-status-development)' },
    impediment:  { label: 'Impedimento',      color: 'var(--color-status-impediment)'  },
    approval:    { label: 'Aprovação',        color: 'var(--color-status-approval)'    },
    done:        { label: 'Finalizada',       color: 'var(--color-status-done)'        },
};

interface KanbanColumnProps {
    groupId: string;
    status: ActivityStatus;
    activities: Activity[];
    canEdit?: boolean;
    onActivityMenuClick?: (activity: Activity, action: ActivityMenuAction) => void;
    onAddActivity?: (status: ActivityStatus) => void;
}

export const KanbanColumn = memo(function KanbanColumn({
    groupId, status, activities, canEdit = false, onActivityMenuClick, onAddActivity,
}: KanbanColumnProps) {
    const config = STATUS_CONFIG[status];
    const { setNodeRef, isOver } = useDroppable({ id: `col__${groupId}__${status}` });
    const itemIds = useMemo(() => activities.map(a => `${groupId}__${a.id}`), [activities, groupId]);

    return (
        <div className={styles.column}>
            <div className={styles.header}>
                <div className={styles.dot} style={{ background: config.color }} />
                <span className={styles.title}>{config.label}</span>
                <span className={styles.count}>{activities.length}</span>
            </div>

            <div
                ref={setNodeRef}
                className={`${styles.cards} ${isOver ? styles.cardsOver : ''}`}
            >
                <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
                    {activities.map(activity => (
                        <ActivityCard
                            key={activity.id}
                            activity={activity}
                            groupId={groupId}
                            canEdit={canEdit}
                            onMenuClick={onActivityMenuClick}
                        />
                    ))}
                </SortableContext>

                {canEdit && (
                    <button className={styles.addBtn} onClick={() => onAddActivity?.(status)}>
                        <PlusIcon size={11} />
                        Criar nova atividade
                    </button>
                )}
            </div>
        </div>
    );
});
