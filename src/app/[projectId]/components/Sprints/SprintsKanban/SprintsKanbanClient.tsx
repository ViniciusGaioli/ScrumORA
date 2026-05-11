"use client";

import { useEffect, useRef, useState } from 'react';
import {
    DndContext, DragEndEvent, DragOverlay, DragStartEvent,
    PointerSensor, closestCorners, useSensor, useSensors,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { Activity } from '../../Kanban/ActivityCard/Activity';
import { ActivityCard } from '../../Kanban/ActivityCard/ActivityCard';
import { ApiSprintInfo, updateActivitySprint } from '../../../services/activityService';
import { SprintSection, SprintMenuAction } from '../SprintSection/SprintSection';
import { Member, ProjectTeam } from '../../Team/MemberCard/Member';

type ColTarget = { kind: 'pb' | 'sb' | 'cc'; sprintId: number };

function parseColumnTarget(id: string): ColTarget | null {
    const m = id.match(/^(pb|sb|cc)col__(.+)$/);
    if (!m) return null;
    const sprintId = Number(m[2]);
    if (Number.isNaN(sprintId)) return null;
    return { kind: m[1] as 'pb' | 'sb' | 'cc', sprintId };
}

function parseCardId(id: string): { sectionSprintId: number; activityId: number } | null {
    const idx = id.lastIndexOf('__');
    if (idx === -1) return null;
    const sec = Number(id.slice(0, idx));
    const act = Number(id.slice(idx + 2));
    if (Number.isNaN(sec) || Number.isNaN(act)) return null;
    return { sectionSprintId: sec, activityId: act };
}

interface Props {
    sprints: ApiSprintInfo[];
    activities: Activity[];
    members: Member[];
    teams: ProjectTeam[];
    canEdit: boolean;
    projectId: string;
    onRefresh: () => void;
    onSprintMenuClick: (sprint: ApiSprintInfo, action: SprintMenuAction) => void;
}

export function SprintsKanbanClient({
    sprints, activities, members, teams, canEdit, projectId, onRefresh, onSprintMenuClick,
}: Props) {
    const [items, setItems] = useState<Activity[]>(activities);
    const [activeCardId, setActiveCardId] = useState<string | null>(null);
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

    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

    function getActivityColumn(a: Activity): ColTarget | null {
        if (!a.sprint) {
            return { kind: 'pb', sprintId: -1 };
        }
        return { kind: a.status === 'done' ? 'cc' : 'sb', sprintId: a.sprint.id };
    }

    function resolveDropTarget(overId: string): ColTarget | null {
        const col = parseColumnTarget(overId);
        if (col) return col;
        const card = parseCardId(overId);
        if (!card) return null;
        const item = itemsRef.current.find(a => a.id === card.activityId);
        if (!item) return null;
        return getActivityColumn(item);
    }

    function applyDrop(activity: Activity, target: ColTarget): { sprintId: number | null; status: Activity['status']; changed: boolean } {
        const currentSprintId = activity.sprint?.id ?? null;
        if (target.kind === 'pb') {
            return {
                sprintId: null,
                status: activity.status,
                changed: currentSprintId !== null,
            };
        }
        if (target.kind === 'sb') {
            const newStatus = activity.status === 'done' ? 'backlog' : activity.status;
            return {
                sprintId: target.sprintId,
                status: newStatus,
                changed: currentSprintId !== target.sprintId || newStatus !== activity.status,
            };
        }
        return {
            sprintId: target.sprintId,
            status: 'done',
            changed: currentSprintId !== target.sprintId || activity.status !== 'done',
        };
    }

    function handleDragStart({ active }: DragStartEvent) {
        setActiveCardId(String(active.id));
    }

    function handleDragEnd({ active, over }: DragEndEvent) {
        const activeIdStr = String(active.id);
        setActiveCardId(null);
        if (!over) return;
        const parsedActive = parseCardId(activeIdStr);
        if (!parsedActive) return;

        const activity = itemsRef.current.find(a => a.id === parsedActive.activityId);
        if (!activity) return;

        const target = resolveDropTarget(String(over.id));
        if (!target) return;

        const result = applyDrop(activity, target);

        setItems(prev => {
            const activeIdx = prev.findIndex(a => a.id === parsedActive.activityId);
            if (activeIdx === -1) return prev;

            const updated: Activity[] = prev.map(a => {
                if (a.id !== parsedActive.activityId) return a;
                const newSprint = result.sprintId === null
                    ? undefined
                    : (a.sprint && a.sprint.id === result.sprintId
                        ? a.sprint
                        : { id: result.sprintId, name: sprints.find(s => s.id === result.sprintId)?.nome ?? '' });
                return { ...a, sprint: newSprint, status: result.status };
            });

            const overId = String(over.id);
            const overCard = parseColumnTarget(overId) ? null : parseCardId(overId);
            let targetIdx = activeIdx;
            if (overCard) {
                const idx = updated.findIndex(a => a.id === overCard.activityId);
                if (idx !== -1) targetIdx = idx;
            } else {
                const sameCol = updated
                    .map((a, i) => ({ a, i }))
                    .filter(({ a }) => {
                        const col = getActivityColumn(a);
                        return col && col.kind === target.kind && (col.kind === 'pb' || col.sprintId === target.sprintId);
                    });
                const last = sameCol[sameCol.length - 1];
                if (last) targetIdx = last.i;
            }

            if (activeIdx === targetIdx) return updated;
            return arrayMove(updated, activeIdx, targetIdx);
        });

        if (result.changed) {
            const token = localStorage.getItem('accessToken');
            if (!token) return;
            updateActivitySprint(
                projectId,
                parsedActive.activityId,
                result.sprintId,
                result.status,
                token,
            ).then(ok => { if (!ok) onRefresh(); }).catch(() => onRefresh());
        }
    }

    const productBacklog = items.filter(a => !a.sprint);
    const activeActivity = activeCardId
        ? (() => {
            const p = parseCardId(activeCardId);
            return p ? items.find(a => a.id === p.activityId) ?? null : null;
        })()
        : null;

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            {sprints.map(sprint => (
                <SprintSection
                    key={sprint.id}
                    sprint={sprint}
                    sprintActivities={items.filter(a => a.sprint?.id === sprint.id)}
                    productBacklog={productBacklog}
                    members={members}
                    teams={teams}
                    projectId={projectId}
                    canEdit={canEdit}
                    onRefresh={onRefresh}
                    onSprintMenuClick={onSprintMenuClick}
                />
            ))}
            <DragOverlay dropAnimation={null}>
                {activeActivity && <ActivityCard activity={activeActivity} canEdit={false} />}
            </DragOverlay>
        </DndContext>
    );
}
