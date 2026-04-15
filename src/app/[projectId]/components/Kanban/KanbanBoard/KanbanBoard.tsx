"use client";

import styles from './KanbanBoard.module.css';
import { KanbanGroup, KanbanGroupData } from '../KanbanGroup/KanbanGroup';
import { Activity, ActivityStatus } from '../ActivityCard/Activity';

interface KanbanBoardProps {
    groups: KanbanGroupData[];
    canEdit?: boolean;
    onActivityClick?: (activity: Activity) => void;
    onActivityMenuClick?: (activity: Activity) => void;
    onAddActivity?: (status: ActivityStatus, groupId: string) => void;
}

export function KanbanBoard({
    groups,
    canEdit = false,
    onActivityClick,
    onActivityMenuClick,
    onAddActivity,
}: KanbanBoardProps) {
    if (groups.length === 0) {
        return (
        <div className={styles.empty}>
            <p className={styles.emptyText}>Nenhuma atividade encontrada.</p>
        </div>
        );
    }

    return (
    <div className={styles.board}>
        {groups.map(group => (
            <KanbanGroup
            key={group.id}
            group={group}
            canEdit={canEdit}
            onActivityClick={onActivityClick}
            onActivityMenuClick={onActivityMenuClick}
            onAddActivity={onAddActivity}
            />
        ))}
    </div>
    );
}