"use client";

import { useState } from 'react';
import { KanbanBoard } from './KanbanBoard';
import { KanbanGroupData } from '../KanbanGroup/KanbanGroup';
import { Activity, ActivityStatus } from '../ActivityCard/Activity';
import { CreateActivityModal } from '../CreateActivityModal/CreateActivityModal';
import { Member } from '../../Team/MemberCard/Member';

interface KanbanBoardClientProps {
    groups: KanbanGroupData[];
    members: Member[];
    canEdit?: boolean;
}

export function KanbanBoardClient({ groups, members, canEdit = false }: KanbanBoardClientProps) {
    const [, setSelectedActivity] = useState<Activity | null>(null);
    const [addTarget, setAddTarget] = useState<{ status: ActivityStatus; groupId: string } | null>(null);

    function handleActivityClick(activity: Activity) {
        setSelectedActivity(activity);
    }

    function handleActivityMenuClick(activity: Activity) {
        setSelectedActivity(activity);
    }

    function handleAddActivity(status: ActivityStatus, groupId: string) {
        setAddTarget({ status, groupId });
    }

    return (
        <>
            <KanbanBoard
                groups={groups}
                canEdit={canEdit}
                onActivityClick={handleActivityClick}
                onActivityMenuClick={handleActivityMenuClick}
                onAddActivity={handleAddActivity}
            />
            {addTarget && (
                <CreateActivityModal
                    status={addTarget.status}
                    members={members}
                    onClose={() => setAddTarget(null)}
                />
            )}
        </>
    );
}
