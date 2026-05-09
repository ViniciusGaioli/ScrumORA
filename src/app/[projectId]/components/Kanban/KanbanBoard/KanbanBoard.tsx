"use client";

import styles from './KanbanBoard.module.css';
import { KanbanGroup, KanbanGroupData } from '../KanbanGroup/KanbanGroup';
import { Activity, ActivityStatus } from '../ActivityCard/Activity';
import { ActivityMenuAction } from '../ActivityCard/ActivityCard';

interface KanbanBoardProps {
    groups: KanbanGroupData[];
    canEdit?: boolean;
    onActivityMenuClick?: (activity: Activity, action: ActivityMenuAction) => void;
    onAddActivity?: (status: ActivityStatus, groupId: string) => void;
}

export function KanbanBoard({ groups, canEdit = false, onActivityMenuClick, onAddActivity }: KanbanBoardProps) {
    const rendered = groups.length > 0
        ? groups
        : [{ id: 'default', label: 'Atividades', activities: [] }];

    return (
        <div className={styles.board}>
            {rendered.map(group => (
                <KanbanGroup
                    key={group.id}
                    group={group}
                    canEdit={canEdit}
                    onActivityMenuClick={onActivityMenuClick}
                    onAddActivity={onAddActivity}
                />
            ))}
        </div>
    );
}
