import { useMemo } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import styles from './TeamGroup.module.css';
import { Member } from '../MemberCard/Member';
import { MemberCard } from '../MemberCard/MemberCard';

export interface TeamGroupData {
    id: string;
    label: string;
    members: Member[];
    isUnassigned?: boolean;
}

interface TeamGroupProps {
    group: TeamGroupData;
    canEdit?: boolean;
}

export function TeamGroup({ group, canEdit = false }: TeamGroupProps) {
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
                            <MemberCard key={member.id} member={member} groupId={group.id} canEdit={canEdit} />
                        ))}
                    </div>
                </SortableContext>
            )}
        </div>
    );
}
