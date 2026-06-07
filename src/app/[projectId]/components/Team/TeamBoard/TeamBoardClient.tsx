"use client";

import { useEffect, useRef, useState } from 'react';
import {
    CollisionDetection, DndContext, DragEndEvent, DragOverlay, DragStartEvent,
    PointerSensor, closestCorners, pointerWithin, rectIntersection, useSensor, useSensors,
} from '@dnd-kit/core';
import { Member, ProjectTeam } from '../MemberCard/Member';
import { MemberCard, MemberMenuAction } from '../MemberCard/MemberCard';
import { TeamGroup } from '../TeamGroup/TeamGroup';
import { EditMemberModal } from '../EditMemberModal/EditMemberModal';
import { groupMembers } from '../../../services/teamService';
import {
    addMemberToTeam, removeMemberFromTeam,
} from '../../../services/teamService';
import styles from './TeamBoard.module.css';

const collisionDetection: CollisionDetection = (args) => {
    const pointerCollisions = pointerWithin(args);
    const column = pointerCollisions.find(c => String(c.id).startsWith('col__'));
    if (column) return [column];
    if (pointerCollisions.length > 0) return pointerCollisions;
    const intersections = rectIntersection(args);
    const intersectColumn = intersections.find(c => String(c.id).startsWith('col__'));
    if (intersectColumn) return [intersectColumn];
    if (intersections.length > 0) return intersections;
    return closestCorners(args);
};

function parseCardId(id: string): { groupId: string; memberId: number } | null {
    const idx = id.lastIndexOf('__');
    if (idx === -1) return null;
    const num = Number(id.slice(idx + 2));
    if (Number.isNaN(num)) return null;
    return { groupId: id.slice(0, idx), memberId: num };
}

function parseColumnId(id: string): string | null {
    return id.startsWith('col__') ? id.slice('col__'.length) : null;
}

function groupIdToTeamId(groupId: string): number | null {
    if (groupId === 'all') return null;
    const m = groupId.match(/^team-(\d+)$/);
    return m ? Number(m[1]) : null;
}

interface Props {
    members: Member[];
    teams: ProjectTeam[];
    canEdit: boolean;
    projectId: string;
    onRefresh: () => void;
}

export function TeamBoardClient({ members, teams, canEdit, projectId, onRefresh }: Props) {
    const [localMembers, setLocalMembers] = useState<Member[]>(members);
    const [activeCardId, setActiveCardId] = useState<string | null>(null);
    const [editTarget, setEditTarget] = useState<{ member: Member; tab: 'edit' | 'remove' } | null>(null);
    const localRef = useRef(localMembers);
    localRef.current = localMembers;

    function handleAction(member: Member, action: MemberMenuAction, groupId: string) {
        if (action === 'remove-from-team') {
            const teamId = groupIdToTeamId(groupId);
            if (teamId === null) return;
            const token = localStorage.getItem('accessToken');
            setLocalMembers(prev => prev.map(m =>
                m.id === member.id ? { ...m, teamIds: m.teamIds.filter(id => id !== teamId) } : m,
            ));
            if (token) {
                removeMemberFromTeam(projectId, teamId, member.id, token)
                    .then(ok => { if (!ok) onRefresh(); })
                    .catch(() => onRefresh());
            }
            return;
        }
        setEditTarget({ member, tab: action === 'remove' ? 'remove' : 'edit' });
    }

    const lastSyncedKey = useRef('');
    useEffect(() => {
        const key = members.map(m => `${m.id}:${m.role}:${m.teamIds.slice().sort().join(',')}`).sort().join('|');
        if (key !== lastSyncedKey.current) {
            setLocalMembers(members);
            lastSyncedKey.current = key;
        }
    }, [members]);

    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

    function handleDragStart({ active }: DragStartEvent) {
        setActiveCardId(String(active.id));
    }

    function handleDragEnd({ active, over }: DragEndEvent) {
        setActiveCardId(null);
        if (!over) return;
        const parsedActive = parseCardId(String(active.id));
        if (!parsedActive) return;

        const overIdStr = String(over.id);
        let targetGroupId: string | null = parseColumnId(overIdStr);
        if (!targetGroupId) {
            const parsedOver = parseCardId(overIdStr);
            if (parsedOver) targetGroupId = parsedOver.groupId;
        }
        if (!targetGroupId) return;

        const sourceGroupId = parsedActive.groupId;
        if (sourceGroupId === targetGroupId) return;

        const sourceTeamId = groupIdToTeamId(sourceGroupId);
        const targetTeamId = groupIdToTeamId(targetGroupId);

        const member = localRef.current.find(m => m.id === parsedActive.memberId);
        if (!member) return;

        const ops: Promise<boolean>[] = [];
        const token = localStorage.getItem('accessToken');

        setLocalMembers(prev => prev.map(m => {
            if (m.id !== parsedActive.memberId) return m;
            let newIds = m.teamIds;
            if (sourceTeamId === null && targetTeamId !== null) {
                if (!newIds.includes(targetTeamId)) newIds = [...newIds, targetTeamId];
            }
            else if (sourceTeamId !== null && targetTeamId === null) {
                newIds = newIds.filter(id => id !== sourceTeamId);
            }
            else if (sourceTeamId !== null && targetTeamId !== null) {
                newIds = newIds.filter(id => id !== sourceTeamId);
                if (!newIds.includes(targetTeamId)) newIds = [...newIds, targetTeamId];
            }
            return { ...m, teamIds: newIds };
        }));

        if (token) {
            if (sourceTeamId === null && targetTeamId !== null) {
                if (!member.teamIds.includes(targetTeamId)) {
                    ops.push(addMemberToTeam(projectId, targetTeamId, member.id, token));
                }
            } else if (sourceTeamId !== null && targetTeamId === null) {
                ops.push(removeMemberFromTeam(projectId, sourceTeamId, member.id, token));
            } else if (sourceTeamId !== null && targetTeamId !== null) {
                ops.push(removeMemberFromTeam(projectId, sourceTeamId, member.id, token));
                if (!member.teamIds.includes(targetTeamId)) {
                    ops.push(addMemberToTeam(projectId, targetTeamId, member.id, token));
                }
            }
        }

        if (ops.length > 0) {
            Promise.all(ops)
                .then(results => { if (results.some(ok => !ok)) onRefresh(); })
                .catch(() => onRefresh());
        }
    }

    const groups = groupMembers(localMembers, teams);
    const activeMember = activeCardId
        ? (() => { const p = parseCardId(activeCardId); return p ? localMembers.find(m => m.id === p.memberId) ?? null : null; })()
        : null;

    if (groups.length === 0 || localMembers.length === 0) {
        return (
            <div className={styles.empty}>
                <p className={styles.emptyText}>Nenhum integrante encontrado.</p>
            </div>
        );
    }

    return (
        <DndContext sensors={sensors} collisionDetection={collisionDetection} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div className={styles.board}>
                {groups.map(group => (
                    <TeamGroup key={group.id} group={group} canEdit={canEdit} onActionClick={(m, action, gId) => handleAction(m, action, gId)} />
                ))}
            </div>
            <DragOverlay dropAnimation={null}>
                {activeMember && <MemberCard member={activeMember} canEdit={false} />}
            </DragOverlay>

            {editTarget && (
                <EditMemberModal
                    member={editTarget.member}
                    projectId={projectId}
                    initialTab={editTarget.tab}
                    onClose={() => setEditTarget(null)}
                    onSaved={onRefresh}
                />
            )}
        </DndContext>
    );
}
