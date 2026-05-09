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

interface CreateSprintModalProps {
    projectId: string;
    activities: Activity[];
    onClose: () => void;
    onCreated: () => void;
}

export function CreateSprintModal({ projectId, activities, onClose, onCreated }: CreateSprintModalProps) {
    const [name, setName] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [search, setSearch] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const backlogActivities = activities.filter(a => !a.sprint);
    const selectedActivities = backlogActivities.filter(a => selectedIds.includes(a.id));
    const suggestions = backlogActivities.filter(a =>
        !selectedIds.includes(a.id) &&
        a.name.toLowerCase().includes(search.toLowerCase())
    );

    const addActivity = (id: number) => { setSelectedIds(prev => [...prev, id]); setSearch(''); };
    const removeActivity = (activity: Activity) => setSelectedIds(prev => prev.filter(id => id !== activity.id));

    async function handleSubmit() {
        if (!name.trim() || !startDate || !endDate) {
            setError('Preencha todos os campos obrigatórios.');
            return;
        }
        setError('');
        setLoading(true);
        try {
            const token = localStorage.getItem('accessToken');

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/projetos/${projectId}/sprints`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ nome: name.trim(), dataInicio: startDate, dataFim: endDate }),
            });
            if (!res.ok) {
                const data = await res.json();
                setError(data.message ?? 'Erro ao criar sprint.');
                return;
            }
            const sprint = await res.json();

            await Promise.all(selectedIds.map(activityId =>
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/projetos/${projectId}/atividades/${activityId}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                    body: JSON.stringify({ sprintId: sprint.id }),
                })
            ));

            onCreated();
            onClose();
        } catch {
            setError('Não foi possível conectar ao servidor.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className={styles.backdrop} onClick={onClose} role="presentation">
            <div
                className={styles.modal}
                style={{ '--accent': 'var(--color-brand)' } as React.CSSProperties}
                onClick={e => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="create-sprint-title"
            >
                <div className={styles.accentBar} />

                <div className={styles.header}>
                    <h2 id="create-sprint-title" className={styles.title}>Criar Sprint</h2>
                    <button className={styles.closeBtn} onClick={onClose} aria-label="Fechar">
                        <IconClose />
                    </button>
                </div>

                <div className={styles.body}>
                    <div className={styles.left}>
                        {error && (
                            <div className={styles.errorBanner}>
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                                </svg>
                                {error}
                            </div>
                        )}
                        <label className={styles.field}>
                            <span className={styles.fieldLabel}>Nome da sprint</span>
                            <input
                                type="text"
                                className={styles.input}
                                value={name}
                                onChange={e => setName(e.target.value)}
                                placeholder="Ex.: Sprint 1"
                                maxLength={50}
                            />
                        </label>
                        <div className={styles.dates}>
                            <label className={styles.field}>
                                <span className={styles.fieldLabel}>Data de início</span>
                                <input type="date" className={styles.input} value={startDate} onChange={e => setStartDate(e.target.value)} />
                            </label>
                            <label className={styles.field}>
                                <span className={styles.fieldLabel}>Data final</span>
                                <input type="date" className={styles.input} value={endDate} onChange={e => setEndDate(e.target.value)} />
                            </label>
                        </div>
                    </div>

                    <div className={styles.right}>
                        <div className={styles.rightHeader}>
                            <span className={styles.sectionTitle}>Product Backlog</span>
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
                                                <button type="button" className={styles.suggestionItem} onClick={() => addActivity(a.id)}>
                                                                    <span style={{ width: '0.5rem', height: '0.5rem', borderRadius: '50%', flexShrink: 0, background: SPRINT_STATUS_COLOR[a.status] }} title={SPRINT_STATUS_LABEL[a.status]} />
                                                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.name}</span>
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>

                        {selectedActivities.length === 0 ? (
                            <p className={styles.empty}>Nenhuma atividade adicionada ao sprint.</p>
                        ) : (
                            <div className={styles.activitiesGrid}>
                                {selectedActivities.map(activity => (
                                    <div key={activity.id} className={styles.activityWrap}>
                                        <ActivityCard activity={activity} canEdit onMenuClick={(a: Activity) => removeActivity(a)} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className={styles.footer}>
                    <button type="button" className={styles.cancelBtn} onClick={onClose}>Cancelar</button>
                    <button type="button" className={styles.submitBtn} onClick={handleSubmit} disabled={loading}>
                        {loading ? 'Criando...' : 'Criar sprint'}
                    </button>
                </div>

                <div className={styles.accentBarBottom} />
            </div>
        </div>
    );
}
