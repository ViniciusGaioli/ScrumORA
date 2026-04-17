"use client";

import styles from './ActivityCard.module.css';
import { Activity } from './Activity';
import CalendarIcon from '@/src/assets/icons/CalendarIcon/CalendarIcon';

const IconMore = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/>
    </svg>
);

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
    canEdit?: boolean;
    onClick?: (activity: Activity) => void;
    onMenuClick?: (activity: Activity) => void;
}

export function ActivityCard({
    activity,
    canEdit = false,
    onClick,
    onMenuClick,
}: ActivityCardProps) {
    const overdue = activity.status !== 'done' && isOverdue(activity.endDate);
    const accent = STATUS_COLOR[activity.status] ?? STATUS_COLOR.backlog;

    const allResponsibles = activity.responsibles.flatMap(r => {
        if (r.user) return [{ id: `u-${r.user.id}`, initials: r.user.initials, name: r.user.name }];
        if (r.team) return [{ id: `t-${r.team.id}`, initials: r.team.name.slice(0, 2).toUpperCase(), name: r.team.name }];
        return [];
    });

    const visibleResponsibles = allResponsibles.slice(0, MAX_VISIBLE_AVATARS);
    const extraCount = allResponsibles.length - MAX_VISIBLE_AVATARS;

    return (
        <div
            className={styles.card}
            style={{ '--accent': accent } as React.CSSProperties}
            onClick={() => onClick?.(activity)}
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
                    <button
                        className={styles.menuBtn}
                        onClick={e => { e.stopPropagation(); onMenuClick?.(activity); }}
                        aria-label="Opções da atividade"
                    >
                        <IconMore />
                    </button>
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
                            <div
                                key={r.id}
                                className={styles.avatar}
                                style={{ background: getAvatarColor(i) }}
                                title={r.name}
                            >
                                {r.initials}
                            </div>
                        ))}
                        {extraCount > 0 && (
                            <div className={`${styles.avatar} ${styles.avatarExtra}`}>
                                +{extraCount}
                            </div>
                        )}
                    </div>
                )}
            </div>
            <div className={styles.accentBarBottom} />
        </div>
    );
}
