"use client";

import styles from './MemberCard.module.css';
import { Member, MemberRole } from './Member';

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
    canEdit?: boolean;
    onMenuClick?: (member: Member) => void;
}

export function MemberCard({ member, canEdit = false, onMenuClick }: MemberCardProps) {
    const accent = ROLE_COLOR[member.role];

    return (
        <div
            className={styles.card}
            style={{ '--accent': accent } as React.CSSProperties}
        >
            <div className={styles.accentBar} />

            <div className={styles.header}>
                <span />
                {canEdit && (
                    <button
                        className={styles.menuBtn}
                        onClick={e => { e.stopPropagation(); onMenuClick?.(member); }}
                        aria-label="Opções do integrante"
                    >
                        <IconMore />
                    </button>
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
}
