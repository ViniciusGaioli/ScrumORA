import { useMemo } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import styles from './TeamGroup.module.css';
import { Member } from '../MemberCard/Member';
import { MemberCard, MemberMenuAction } from '../MemberCard/MemberCard';

export interface TeamGroupData {
    id: string;
    label: string;
    members: Member[];
    isUnassigned?: boolean;
}

interface TeamGroupProps {
    group: TeamGroupData;
    canEdit?: boolean;
    onActionClick?: (member: Member, action: MemberMenuAction, groupId: string) => void;
}

export function TeamGroup({ group, canEdit = false, onActionClick }: TeamGroupProps) {
    const { setNodeRef, isOver } = useDroppable({ id: `col__${group.id}` });
    const itemIds = useMemo(() => group.members.map(m => `${group.id}__${m.id}`), [group.members, group.id]);

    return (
        <div className={styles.group}>
            <div className={styles.header}>
                <span className={`${styles.label} ${group.isUnassigned ? styles.labelMuted : ''}`}>
                    {group.label}
                </span>
                <span className={styles.count}>{group.members.length}</span>
                <div className={styles.divider} />
            </div>

            {group.members.length === 0 ? (
                <div ref={setNodeRef} className={isOver ? styles.gridOver : ''}>
                    <p className={styles.empty}>Nenhum integrante nesta equipe.</p>
                </div>
            ) : (
                <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
                    <div ref={setNodeRef} className={`${styles.grid} ${isOver ? styles.gridOver : ''}`}>
                        {group.members.map(member => (
                            <MemberCard key={member.id} member={member} groupId={group.id} canEdit={canEdit} onActionClick={onActionClick ? (m, action, gId) => onActionClick(m, action, gId) : undefined} />
                        ))}
                    </div>
                </SortableContext>
            )}
        </div>
    );
}
