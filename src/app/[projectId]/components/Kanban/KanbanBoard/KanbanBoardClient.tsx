"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    DndContext, DragEndEvent, DragOverEvent, DragOverlay, DragStartEvent,
    PointerSensor, closestCorners, useSensor, useSensors,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { KanbanBoard } from './KanbanBoard';
import { groupActivities } from './groupActivities';
import { Activity, ActivityStatus } from '../ActivityCard/Activity';
import { ActivityCard, ActivityMenuAction } from '../ActivityCard/ActivityCard';
import { CreateActivityModal } from '../CreateActivityModal/CreateActivityModal';
import { EditActivityModal } from '../EditActivityModal/EditActivityModal';
import { Member, ProjectTeam } from '../../Team/MemberCard/Member';

const COL_PREFIX = 'col__';
const SEP = '__';

export function makeColumnId(groupId: string, status: ActivityStatus): string {
    return `${COL_PREFIX}${groupId}${SEP}${status}`;
}

export function makeCardId(groupId: string, activityId: number): string {
    return `${groupId}${SEP}${activityId}`;
}

function parseColumnId(id: string): { groupId: string; status: ActivityStatus } | null {
    if (!id.startsWith(COL_PREFIX)) return null;
    const rest = id.slice(COL_PREFIX.length);
    const idx = rest.lastIndexOf(SEP);
    if (idx === -1) return null;
    return {
        groupId: rest.slice(0, idx),
        status: rest.slice(idx + SEP.length) as ActivityStatus,
    };
}

function parseCardId(id: string): { groupId: string; activityId: number } | null {
    if (id.startsWith(COL_PREFIX)) return null;
    const idx = id.lastIndexOf(SEP);
    if (idx === -1) return null;
    const num = Number(id.slice(idx + SEP.length));
    if (Number.isNaN(num)) return null;
    return { groupId: id.slice(0, idx), activityId: num };
}

interface Props {
    projectId: string;
    activities: Activity[];
    groupBy: 'team' | 'sprint';
    members: Member[];
    teams: ProjectTeam[];
    canEdit?: boolean;
    onCreated: () => void;
    onStatusChange: (activityId: number, newStatus: ActivityStatus) => void;
}

export function KanbanBoardClient({
    projectId, activities, groupBy, members, teams,
    canEdit = false, onCreated, onStatusChange,
}: Props) {
    const [items, setItems] = useState<Activity[]>(activities);
    const [activeCardId, setActiveCardId] = useState<string | null>(null);
    const [addTarget, setAddTarget] = useState<{ status: ActivityStatus; groupId: string } | null>(null);
    const [editTarget, setEditTarget] = useState<{ activity: Activity; tab: 'edit' | 'delete' } | null>(null);

    const itemsRef = useRef(items);
    itemsRef.current = items;

    const lastSyncedIdsRef = useRef('');
    useEffect(() => {
        const key = activities.map(a => a.id).sort().join(',');
        if (key !== lastSyncedIdsRef.current) {
            setItems(activities);
            lastSyncedIdsRef.current = key;
        }
    }, [activities]);

    const groups = useMemo(() => groupActivities(items, groupBy), [items, groupBy]);

    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

    function handleDragStart({ active }: DragStartEvent) {
        setActiveCardId(String(active.id));
    }

    function handleDragOver({ active, over }: DragOverEvent) {
        if (!over) return;
        const activeId = String(active.id);
        const overId = String(over.id);
        if (activeId === overId) return;

        const parsedActive = parseCardId(activeId);
        if (!parsedActive) return;

        const overCol = parseColumnId(overId);
        const overCard = overCol ? null : parseCardId(overId);

        let targetStatus: ActivityStatus | null = null;
        let overActivityId: number | null = null;
        if (overCol) {
            targetStatus = overCol.status;
        } else if (overCard) {
            const item = itemsRef.current.find(a => a.id === overCard.activityId);
            if (item) {
                targetStatus = item.status;
                overActivityId = overCard.activityId;
            }
        }
        if (!targetStatus) return;

        const activeItem = itemsRef.current.find(a => a.id === parsedActive.activityId);
        if (!activeItem || activeItem.status === targetStatus) return;

        const translatedRect = active.rect.current.translated;
        const overRect = over.rect;
        const isBelow =
            overActivityId !== null && translatedRect != null
                ? translatedRect.top + translatedRect.height / 2 > overRect.top + overRect.height / 2
                : false;

        setItems(prev => {
            const activeIdx = prev.findIndex(a => a.id === parsedActive.activityId);
            if (activeIdx === -1) return prev;

            let targetIdx: number;
            if (overActivityId !== null) {
                const overIdx = prev.findIndex(a => a.id === overActivityId);
                if (overIdx === -1) return prev;
                targetIdx = isBelow ? overIdx + 1 : overIdx;
            } else {
                const lastIdx = prev.findLastIndex(a => a.status === targetStatus);
                targetIdx = lastIdx === -1 ? prev.length : lastIdx + 1;
            }

            const updated = prev.map(a =>
                a.id === parsedActive.activityId ? { ...a, status: targetStatus! } : a
            );

            const adjusted = targetIdx > activeIdx ? targetIdx - 1 : targetIdx;
            if (activeIdx === adjusted) return updated;
            return arrayMove(updated, activeIdx, adjusted);
        });
    }

    function handleDragEnd({ active, over }: DragEndEvent) {
        const activeIdStr = String(active.id);
        const parsedActive = parseCardId(activeIdStr);
        setActiveCardId(null);

        if (!over || !parsedActive) return;
        const overId = String(over.id);

        const overCol = parseColumnId(overId);
        const parsedOver = overCol ? null : parseCardId(overId);

        let dropStatus: ActivityStatus | null = null;
        if (overCol) {
            dropStatus = overCol.status;
        } else if (parsedOver) {
            const overItem = itemsRef.current.find(a => a.id === parsedOver.activityId);
            dropStatus = overItem?.status ?? null;
        }

        setItems(prev => {
            const activeIdx = prev.findIndex(a => a.id === parsedActive.activityId);
            if (activeIdx === -1) return prev;

            let targetIdx: number;
            if (overCol) {
                const lastIdx = prev.findLastIndex(a => a.status === overCol.status);
                targetIdx = lastIdx === -1 ? prev.length - 1 : lastIdx;
            } else if (parsedOver) {
                targetIdx = prev.findIndex(a => a.id === parsedOver.activityId);
                if (targetIdx === -1) return prev;
            } else {
                return prev;
            }

            const needsStatusUpdate = dropStatus !== null && prev[activeIdx].status !== dropStatus;
            const withStatus = needsStatusUpdate
                ? prev.map(a => a.id === parsedActive.activityId ? { ...a, status: dropStatus! } : a)
                : prev;

            if (activeIdx === targetIdx) return withStatus;
            return arrayMove(withStatus, activeIdx, targetIdx);
        });

        const original = activities.find(a => a.id === parsedActive.activityId);
        if (original && dropStatus && original.status !== dropStatus) {
            onStatusChange(parsedActive.activityId, dropStatus);
        }
    }

    const handleActivityMenuClick = useCallback((activity: Activity, action: ActivityMenuAction) => {
        setEditTarget({ activity, tab: action });
    }, []);

    const handleAddActivity = useCallback((status: ActivityStatus, groupId: string) => {
        setAddTarget({ status, groupId });
    }, []);

    const activeActivity = useMemo(() => {
        if (!activeCardId) return null;
        const parsed = parseCardId(activeCardId);
        if (!parsed) return null;
        return items.find(a => a.id === parsed.activityId) ?? null;
    }, [activeCardId, items]);

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
        >
            <KanbanBoard
                groups={groups}
                canEdit={canEdit}
                onActivityMenuClick={handleActivityMenuClick}
                onAddActivity={handleAddActivity}
            />
            <DragOverlay dropAnimation={null}>
                {activeActivity && <ActivityCard activity={activeActivity} canEdit={false} />}
            </DragOverlay>

            {addTarget && (
                <CreateActivityModal
                    projectId={projectId}
                    status={addTarget.status}
                    members={members}
                    teams={teams}
                    onClose={() => setAddTarget(null)}
                    onCreated={onCreated}
                />
            )}
            {editTarget && (
                <EditActivityModal
                    activity={editTarget.activity}
                    projectId={projectId}
                    members={members}
                    teams={teams}
                    initialTab={editTarget.tab}
                    onClose={() => setEditTarget(null)}
                    onSaved={onCreated}
                />
            )}
        </DndContext>
    );
}
