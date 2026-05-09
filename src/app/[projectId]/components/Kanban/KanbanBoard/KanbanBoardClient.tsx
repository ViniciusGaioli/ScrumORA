"use client";

import { useState } from 'react';
import { KanbanBoard } from './KanbanBoard';
import { KanbanGroupData } from '../KanbanGroup/KanbanGroup';
import { Activity, ActivityStatus } from '../ActivityCard/Activity';
import { ActivityMenuAction } from '../ActivityCard/ActivityCard';
import { CreateActivityModal } from '../CreateActivityModal/CreateActivityModal';
import { EditActivityModal } from '../EditActivityModal/EditActivityModal';
import { Member } from '../../Team/MemberCard/Member';

interface KanbanBoardClientProps {
    projectId: string;
    groups: KanbanGroupData[];
    members: Member[];
    canEdit?: boolean;
    onCreated: () => void;
}

export function KanbanBoardClient({ projectId, groups, members, canEdit = false, onCreated }: KanbanBoardClientProps) {
    const [addTarget, setAddTarget] = useState<{ status: ActivityStatus; groupId: string } | null>(null);
    const [editTarget, setEditTarget] = useState<{ activity: Activity; tab: 'edit' | 'delete' } | null>(null);

    function handleActivityMenuClick(activity: Activity, action: ActivityMenuAction) {
        setEditTarget({ activity, tab: action });
    }

    function handleAddActivity(status: ActivityStatus, groupId: string) {
        setAddTarget({ status, groupId });
    }

    return (
        <>
            <KanbanBoard
                groups={groups}
                canEdit={canEdit}
                onActivityMenuClick={handleActivityMenuClick}
                onAddActivity={handleAddActivity}
            />

            {addTarget && (
                <CreateActivityModal
                    projectId={projectId}
                    status={addTarget.status}
                    members={members}
                    onClose={() => setAddTarget(null)}
                    onCreated={onCreated}
                />
            )}

            {editTarget && (
                <EditActivityModal
                    activity={editTarget.activity}
                    projectId={projectId}
                    members={members}
                    initialTab={editTarget.tab}
                    onClose={() => setEditTarget(null)}
                    onSaved={onCreated}
                />
            )}
        </>
    );
}
