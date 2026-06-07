"use client";

import { memo } from 'react';
import styles from './TeamResponsibleCard.module.css';
import { Member, MemberRole } from '../MemberCard/Member';
import MoreIcon from '@/src/assets/icons/MoreIcon/MoreIcon';

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

interface TeamResponsibleCardProps {
    team: { id: number; name: string };
    members?: Member[];
    canEdit?: boolean;
    onRemove?: (team: { id: number; name: string }) => void;
}

export const TeamResponsibleCard = memo(function TeamResponsibleCard({ team, members = [], canEdit = false, onRemove }: TeamResponsibleCardProps) {
    const cardStyle: React.CSSProperties = { '--accent': 'var(--color-brand)' } as React.CSSProperties;

    return (
        <div className={styles.card} style={cardStyle}>
            <div className={styles.accentBar} />

            <div className={styles.header}>
                <div className={styles.titleGroup}>
                    <span className={styles.label}>Equipe</span>
                    <p className={styles.name}>{team.name}</p>
                </div>
                {canEdit && (
                    <button
                        type="button"
                        className={styles.menuBtn}
                        onClick={e => { e.stopPropagation(); onRemove?.(team); }}
                        aria-label="Remover equipe"
                    >
                        <MoreIcon />
                    </button>
                )}
            </div>

            {members.length === 0 ? (
                <p className={styles.emptyMembers}>Nenhum integrante nesta equipe.</p>
            ) : (
                <div className={styles.membersGrid}>
                    {members.map(m => (
                        <div key={m.id} className={styles.miniMember}>
                            <div className={styles.miniAvatar} style={{ background: ROLE_COLOR[m.role] }}>
                                {m.initials}
                            </div>
                            <p className={styles.miniName} title={m.name}>{m.name}</p>
                            <span className={styles.miniRole}>{ROLE_LABEL[m.role]}</span>
                        </div>
                    ))}
                </div>
            )}

            <div className={styles.accentBarBottom} />
        </div>
    );
});
