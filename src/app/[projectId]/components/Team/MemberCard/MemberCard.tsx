"use client";

import { memo, useEffect, useRef, useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import styles from './MemberCard.module.css';
import { Member, MemberRole } from './Member';

export type MemberMenuAction = 'edit' | 'remove';

const IconMore = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/>
    </svg>
);

const ROLE_COLOR: Record<MemberRole, string> = {
    scrum_master:  'var(--color-brand)',
    product_owner: 'var(--color-role-po-accent)',
    member:        'var(--color-role-int-accent)',
};

const ROLE_LABEL: Record<MemberRole, string> = {
    scrum_master:  'Scrum Master',
    product_owner: 'Product Owner',
    member:        'Integrante',
};

const ROLE_CLASS: Record<MemberRole, string> = {
    scrum_master:  styles.roleSm,
    product_owner: styles.rolePo,
    member:        styles.roleInt,
};

interface MemberCardProps {
    member: Member;
    groupId?: string;
    canEdit?: boolean;
    onMenuClick?: (member: Member) => void;
    onActionClick?: (member: Member, action: MemberMenuAction) => void;
}

export const MemberCard = memo(function MemberCard({ member, groupId, canEdit = false, onMenuClick, onActionClick }: MemberCardProps) {
    const accent = ROLE_COLOR[member.role];
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const sortableId = groupId !== undefined ? `${groupId}__${member.id}` : `static__${member.id}`;
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: sortableId,
        disabled: groupId === undefined || !canEdit,
    });

    useEffect(() => {
        if (!menuOpen) return;
        function handleClickOutside(e: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setMenuOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [menuOpen]);

    function handleAction(action: MemberMenuAction) {
        setMenuOpen(false);
        onActionClick?.(member, action);
    }

    const cardStyle: React.CSSProperties = { '--accent': accent } as React.CSSProperties;
    if (!isDragging) {
        cardStyle.transform = CSS.Transform.toString(transform);
        cardStyle.transition = transition;
    }

    return (
        <div
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            className={`${styles.card} ${isDragging ? styles.cardDragging : ''}`}
            style={cardStyle}
        >
            <div className={styles.accentBar} />

            <div className={styles.header}>
                <span />
                {canEdit && (
                    onActionClick ? (
                        <div className={styles.menuWrap} ref={menuRef} onPointerDown={e => e.stopPropagation()}>
                            <button
                                className={styles.menuBtn}
                                onPointerDown={e => e.stopPropagation()}
                                onClick={e => { e.stopPropagation(); setMenuOpen(v => !v); }}
                                aria-label="Opções do integrante"
                            >
                                <IconMore />
                            </button>
                            {menuOpen && (
                                <div className={styles.dropdown} onPointerDown={e => e.stopPropagation()} onClick={e => e.stopPropagation()}>
                                    <button className={styles.dropdownItem} onClick={() => handleAction('edit')}>Editar</button>
                                    <button className={`${styles.dropdownItem} ${styles.dropdownItemDelete}`} onClick={() => handleAction('remove')}>Remover do projeto</button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <button
                            className={styles.menuBtn}
                            onPointerDown={e => e.stopPropagation()}
                            onClick={e => { e.stopPropagation(); onMenuClick?.(member); }}
                            aria-label="Opções do integrante"
                        >
                            <IconMore />
                        </button>
                    )
                )}
            </div>

            <div className={styles.avatar} style={{ background: accent }}>
                {member.initials}
            </div>

            <p className={styles.name}>{member.name}</p>

            <span className={`${styles.role} ${ROLE_CLASS[member.role]}`}>
                {ROLE_LABEL[member.role]}
            </span>

            <div className={styles.accentBarBottom} />
        </div>
    );
});
