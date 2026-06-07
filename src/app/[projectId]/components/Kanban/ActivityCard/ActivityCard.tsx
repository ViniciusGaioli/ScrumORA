"use client";

import { memo, useEffect, useRef, useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import styles from './ActivityCard.module.css';
import { Activity } from './Activity';
import CalendarIcon from '@/src/assets/icons/CalendarIcon/CalendarIcon';
import MoreIcon from '@/src/assets/icons/MoreIcon/MoreIcon';

export type ActivityMenuAction = 'edit' | 'delete';

function formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

function isOverdue(dateStr: string): boolean {
    return new Date(dateStr) < new Date();
}

const STATUS_COLOR: Record<string, string> = {
    backlog:     'var(--color-status-backlog)',
    development: 'var(--color-status-development)',
    impediment:  'var(--color-status-impediment)',
    approval:    'var(--color-status-approval)',
    done:        'var(--color-status-done)',
};

const MAX_VISIBLE_AVATARS = 3;

const AVATAR_COLORS = [
    'var(--color-avatar-1)',
    'var(--color-avatar-2)',
    'var(--color-avatar-3)',
    'var(--color-avatar-4)',
    'var(--color-avatar-5)',
    'var(--color-avatar-6)',
];

function getAvatarColor(index: number): string {
    return AVATAR_COLORS[index % AVATAR_COLORS.length];
}

interface ActivityCardProps {
    activity: Activity;
    groupId?: string;
    canEdit?: boolean;
    onMenuClick?: (activity: Activity, action: ActivityMenuAction) => void;
}

export const ActivityCard = memo(function ActivityCard({ activity, groupId, canEdit = false, onMenuClick }: ActivityCardProps) {
    const overdue = activity.status !== 'done' && isOverdue(activity.endDate);
    const accent = STATUS_COLOR[activity.status] ?? STATUS_COLOR.backlog;
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const sortableId = groupId !== undefined ? `${groupId}__${activity.id}` : `static__${activity.id}`;
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

    function handleAction(action: ActivityMenuAction) {
        setMenuOpen(false);
        onMenuClick?.(activity, action);
    }

    const allResponsibles = activity.responsibles.flatMap(r => {
        if (r.user) return [{ id: `u-${r.user.id}`, initials: r.user.initials, name: r.user.name }];
        if (r.team) return [{ id: `t-${r.team.id}`, initials: r.team.name.slice(0, 2).toUpperCase(), name: r.team.name }];
        return [];
    });

    const visibleResponsibles = allResponsibles.slice(0, MAX_VISIBLE_AVATARS);
    const extraCount = allResponsibles.length - MAX_VISIBLE_AVATARS;

    const style: React.CSSProperties = { '--accent': accent } as React.CSSProperties;
    if (!isDragging) {
        style.transform = CSS.Transform.toString(transform);
        style.transition = transition;
    }

    return (
        <div
            ref={setNodeRef}
            className={`${styles.card} ${isDragging ? styles.cardDragging : ''}`}
            style={style}
            onClick={() => !isDragging && onMenuClick?.(activity, 'edit')}
            {...listeners}
            {...attributes}
        >
            <div className={styles.accentBar} />
            <div className={styles.top}>
                {activity.sprint ? (
                    <span className={styles.sprintTag}>
                        <span className={styles.sprintDot} />
                        Sprint {activity.sprint.id}
                    </span>
                ) : <span />}

                {canEdit && (
                    <div className={styles.menuWrap} ref={menuRef}>
                        <button
                            className={styles.menuBtn}
                            onClick={e => { e.stopPropagation(); setMenuOpen(v => !v); }}
                            aria-label="Opções da atividade"
                        >
                            <MoreIcon />
                        </button>
                        {menuOpen && (
                            <div className={styles.dropdown} onClick={e => e.stopPropagation()}>
                                <button className={styles.dropdownItem} onClick={() => handleAction('edit')}>Editar</button>
                                <button className={`${styles.dropdownItem} ${styles.dropdownItemDelete}`} onClick={() => handleAction('delete')}>Excluir</button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <p className={styles.name}>{activity.name}</p>

            {activity.description && (
                <p className={styles.description}>{activity.description}</p>
            )}

            <div className={styles.meta}>
                <span className={`${styles.date} ${overdue ? styles.dateOverdue : ''}`}>
                    <CalendarIcon size={10} />
                    {formatDate(activity.endDate)}
                </span>

                {visibleResponsibles.length > 0 && (
                    <div className={styles.avatars}>
                        {visibleResponsibles.map((r, i) => (
                            <div key={r.id} className={styles.avatar} style={{ background: getAvatarColor(i) }} title={r.name}>
                                {r.initials}
                            </div>
                        ))}
                        {extraCount > 0 && (
                            <div className={`${styles.avatar} ${styles.avatarExtra}`}>+{extraCount}</div>
                        )}
                    </div>
                )}
            </div>
            <div className={styles.accentBarBottom} />
        </div>
    );
});
