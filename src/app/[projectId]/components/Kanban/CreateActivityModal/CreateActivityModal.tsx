"use client";

import { useState } from 'react';
import styles from './CreateActivityModal.module.css';
import { MemberCard } from '../../Team/MemberCard/MemberCard';
import { Member } from '../../Team/MemberCard/Member';
import { ActivityStatus } from '../ActivityCard/Activity';

const IconClose = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"/>
        <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
);

const IconSearch = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="7"/>
        <line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
);

const STATUS_COLOR: Record<ActivityStatus, string> = {
    backlog:     'var(--color-status-backlog)',
    development: 'var(--color-status-development)',
    impediment:  'var(--color-status-impediment)',
    approval:    'var(--color-status-approval)',
    done:        'var(--color-status-done)',
};

const STATUS_LABEL: Record<ActivityStatus, string> = {
    backlog:     'Backlog',
    development: 'Desenvolvimento',
    impediment:  'Impedimento',
    approval:    'Aprovação',
    done:        'Finalizada',
};

interface CreateActivityModalProps {
    status: ActivityStatus;
    members: Member[];
    onClose: () => void;
}

export function CreateActivityModal({ status, members, onClose }: CreateActivityModalProps) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [search, setSearch] = useState('');

    const accent = STATUS_COLOR[status];

    const selectedMembers = members.filter(m => selectedIds.includes(m.id));
    const suggestions = search.trim().length > 0
        ? members.filter(m =>
            !selectedIds.includes(m.id) &&
            m.name.toLowerCase().includes(search.toLowerCase())
        )
        : [];

    const addMember = (id: number) => {
        setSelectedIds(prev => [...prev, id]);
        setSearch('');
    };

    const removeMember = (member: Member) => {
        setSelectedIds(prev => prev.filter(id => id !== member.id));
    };

    return (
        <div className={styles.backdrop} onClick={onClose} role="presentation">
            <div
                className={styles.modal}
                style={{ '--accent': accent } as React.CSSProperties}
                onClick={e => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="create-activity-title"
            >
                <div className={styles.accentBar} />

                <div className={styles.header}>
                    <div>
                        <h2 id="create-activity-title" className={styles.title}>Criar nova atividade</h2>
                        <span className={styles.statusTag}>
                            <span className={styles.statusDot} />
                            {STATUS_LABEL[status]}
                        </span>
                    </div>
                    <button className={styles.closeBtn} onClick={onClose} aria-label="Fechar">
                        <IconClose />
                    </button>
                </div>

                <div className={styles.body}>
                    <div className={styles.left}>
                        <label className={styles.field}>
                            <span className={styles.fieldLabel}>Nome da atividade</span>
                            <input
                                type="text"
                                className={styles.input}
                                value={name}
                                onChange={e => setName(e.target.value)}
                                placeholder="Dê um nome à atividade"
                            />
                        </label>

                        <label className={styles.field}>
                            <span className={styles.fieldLabel}>Descrição</span>
                            <textarea
                                className={styles.textarea}
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                placeholder="Descreva o que precisa ser feito"
                                rows={5}
                            />
                        </label>

                        <div className={styles.dates}>
                            <label className={styles.field}>
                                <span className={styles.fieldLabel}>Data de início</span>
                                <input
                                    type="date"
                                    className={styles.input}
                                    value={startDate}
                                    onChange={e => setStartDate(e.target.value)}
                                />
                            </label>
                            <label className={styles.field}>
                                <span className={styles.fieldLabel}>Data final</span>
                                <input
                                    type="date"
                                    className={styles.input}
                                    value={endDate}
                                    onChange={e => setEndDate(e.target.value)}
                                />
                            </label>
                        </div>
                    </div>

                    <div className={styles.right}>
                        <div className={styles.rightHeader}>
                            <span className={styles.sectionTitle}>Responsáveis</span>
                            <div className={styles.searchWrap}>
                                <span className={styles.searchIcon}><IconSearch /></span>
                                <input
                                    type="text"
                                    className={styles.searchInput}
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    placeholder="Buscar integrante"
                                />
                                {suggestions.length > 0 && (
                                    <ul className={styles.suggestions}>
                                        {suggestions.map(m => (
                                            <li key={m.id}>
                                                <button
                                                    type="button"
                                                    className={styles.suggestionItem}
                                                    onClick={() => addMember(m.id)}
                                                >
                                                    <span className={styles.suggestionInitials}>{m.initials}</span>
                                                    <span>{m.name}</span>
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>

                        {selectedMembers.length === 0 ? (
                            <p className={styles.empty}>Nenhum integrante adicionado ainda.</p>
                        ) : (
                            <div className={styles.responsiblesGrid}>
                                {selectedMembers.map(member => (
                                    <MemberCard
                                        key={member.id}
                                        member={member}
                                        canEdit
                                        onMenuClick={removeMember}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className={styles.footer}>
                    <button type="button" className={styles.cancelBtn} onClick={onClose}>
                        Cancelar
                    </button>
                    <button type="button" className={styles.submitBtn}>
                        Criar atividade
                    </button>
                </div>

                <div className={styles.accentBarBottom} />
            </div>
        </div>
    );
}
