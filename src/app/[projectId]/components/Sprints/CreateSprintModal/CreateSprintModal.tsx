"use client";

import { useState } from 'react';
import styles from './CreateSprintModal.module.css';
import { Activity } from '../../Kanban/ActivityCard/Activity';
import { ActivityCard } from '../../Kanban/ActivityCard/ActivityCard';
import { SPRINT_STATUS_COLOR, SPRINT_STATUS_LABEL } from '../SprintStatusChart/SprintStatusChart';

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

interface SprintEditable {
    id: number;
    name: string;
    description?: string;
    activityIds: number[];
}

interface CreateSprintModalProps {
    activities: Activity[];
    sprint?: SprintEditable;
    onClose: () => void;
}

export function CreateSprintModal({ activities, sprint, onClose }: CreateSprintModalProps) {
    const isEdit = sprint !== undefined;
    const [name, setName] = useState(sprint?.name ?? '');
    const [description, setDescription] = useState(sprint?.description ?? '');
    const [selectedIds, setSelectedIds] = useState<number[]>(sprint?.activityIds ?? []);
    const [search, setSearch] = useState('');

    const selectedActivities = activities.filter(a => selectedIds.includes(a.id));
    const suggestions = search.trim().length > 0
        ? activities.filter(a =>
            !selectedIds.includes(a.id) &&
            a.name.toLowerCase().includes(search.toLowerCase())
        )
        : [];

    const addActivity = (id: number) => {
        setSelectedIds(prev => [...prev, id]);
        setSearch('');
    };

    const removeActivity = (activity: Activity) => {
        setSelectedIds(prev => prev.filter(id => id !== activity.id));
    };

    return (
        <div className={styles.backdrop} onClick={onClose} role="presentation">
            <div
                className={styles.modal}
                onClick={e => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="create-sprint-title"
            >
                <div className={styles.accentBar} />

                <div className={styles.header}>
                    <h2 id="create-sprint-title" className={styles.title}>
                        {isEdit ? `Editar Sprint ${sprint!.id}` : 'Criar Sprint'}
                    </h2>
                    <button className={styles.closeBtn} onClick={onClose} aria-label="Fechar">
                        <IconClose />
                    </button>
                </div>

                <div className={styles.body}>
                    <div className={styles.left}>
                        <label className={styles.field}>
                            <span className={styles.fieldLabel}>Nome da sprint</span>
                            <input
                                type="text"
                                className={styles.input}
                                value={name}
                                onChange={e => setName(e.target.value)}
                                placeholder="Ex.: Sprint 4"
                            />
                        </label>

                        <label className={styles.field}>
                            <span className={styles.fieldLabel}>Descrição</span>
                            <textarea
                                className={styles.textarea}
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                placeholder="Descreva o objetivo da sprint"
                                rows={5}
                            />
                        </label>
                    </div>

                    <div className={styles.right}>
                        <div className={styles.rightHeader}>
                            <span className={styles.sectionTitle}>Atividades</span>
                            <div className={styles.searchWrap}>
                                <span className={styles.searchIcon}><IconSearch /></span>
                                <input
                                    type="text"
                                    className={styles.searchInput}
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    placeholder="Buscar atividade"
                                />
                                {suggestions.length > 0 && (
                                    <ul className={styles.suggestions}>
                                        {suggestions.map(a => (
                                            <li key={a.id}>
                                                <button
                                                    type="button"
                                                    className={styles.suggestionItem}
                                                    onClick={() => addActivity(a.id)}
                                                >
                                                    <span
                                                        className={styles.statusDot}
                                                        style={{ background: SPRINT_STATUS_COLOR[a.status] }}
                                                        title={SPRINT_STATUS_LABEL[a.status]}
                                                    />
                                                    <span className={styles.suggestionName}>{a.name}</span>
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>

                        {selectedActivities.length === 0 ? (
                            <p className={styles.empty}>Nenhuma atividade adicionada ainda.</p>
                        ) : (
                            <div className={styles.activitiesGrid}>
                                {selectedActivities.map(activity => (
                                    <div key={activity.id} className={styles.activityWrap}>
                                        <ActivityCard activity={activity} canEdit onMenuClick={removeActivity} />
                                    </div>
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
                        {isEdit ? 'Salvar alterações' : 'Criar sprint'}
                    </button>
                </div>

                <div className={styles.accentBarBottom} />
            </div>
        </div>
    );
}
