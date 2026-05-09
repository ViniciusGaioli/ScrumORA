"use client";

import { useState } from 'react';
import styles from '../CreateSprintModal/CreateSprintModal.module.css';
import tabStyles from './EditSprintModal.module.css';
import { ApiSprintInfo } from '../../../services/activityService';

type SprintStatus = 'planejada' | 'em_andamento' | 'concluida' | 'cancelada';
type Tab = 'edit' | 'delete';

const STATUS_OPTIONS: { value: SprintStatus; label: string }[] = [
    { value: 'planejada',    label: 'Planejada' },
    { value: 'em_andamento', label: 'Em andamento' },
    { value: 'concluida',    label: 'Concluída' },
    { value: 'cancelada',    label: 'Cancelada' },
];

const IconClose = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
);

const IconWarn = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
);

interface EditSprintModalProps {
    sprint: ApiSprintInfo;
    projectId: string;
    initialTab?: Tab;
    onClose: () => void;
    onSaved: () => void;
}

export function EditSprintModal({ sprint, projectId, initialTab = 'edit', onClose, onSaved }: EditSprintModalProps) {
    const [tab, setTab] = useState<Tab>(initialTab);

    const [name, setName] = useState(sprint.nome);
    const [startDate, setStartDate] = useState(sprint.dataInicio.slice(0, 10));
    const [endDate, setEndDate] = useState(sprint.dataFim.slice(0, 10));
    const [status, setStatus] = useState<SprintStatus>(sprint.status as SprintStatus);
    const [editError, setEditError] = useState('');
    const [editLoading, setEditLoading] = useState(false);

    const [deleteError, setDeleteError] = useState('');
    const [deleteLoading, setDeleteLoading] = useState(false);

    async function handleSave() {
        if (!name.trim() || !startDate || !endDate) {
            setEditError('Preencha todos os campos obrigatórios.');
            return;
        }
        setEditError('');
        setEditLoading(true);
        try {
            const token = localStorage.getItem('accessToken');
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/projetos/${projectId}/sprints/${sprint.id}`,
                {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                    body: JSON.stringify({ nome: name.trim(), dataInicio: startDate, dataFim: endDate, status }),
                },
            );
            if (!res.ok) {
                const data = await res.json();
                setEditError(data.message ?? 'Erro ao salvar sprint.');
                return;
            }
            onSaved();
            onClose();
        } catch {
            setEditError('Não foi possível conectar ao servidor.');
        } finally {
            setEditLoading(false);
        }
    }

    async function handleDelete() {
        setDeleteError('');
        setDeleteLoading(true);
        try {
            const token = localStorage.getItem('accessToken');
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/projetos/${projectId}/sprints/${sprint.id}`,
                { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } },
            );
            if (!res.ok && res.status !== 204) {
                const data = await res.json().catch(() => ({}));
                setDeleteError(data.message ?? 'Erro ao excluir sprint.');
                return;
            }
            onSaved();
            onClose();
        } catch {
            setDeleteError('Não foi possível conectar ao servidor.');
        } finally {
            setDeleteLoading(false);
        }
    }

    return (
        <div className={styles.backdrop} onClick={onClose} role="presentation">
            <div
                className={styles.modal}
                style={{ '--accent': 'var(--color-brand)', maxWidth: '30rem' } as React.CSSProperties}
                onClick={e => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="edit-sprint-title"
            >
                <div className={styles.accentBar} />

                <div className={styles.header}>
                    <div>
                        <h2 id="edit-sprint-title" className={styles.title}>{sprint.nome}</h2>
                        <div className={tabStyles.tabRow}>
                            <button
                                className={`${tabStyles.tab} ${tab === 'edit' ? tabStyles.tabActive : ''}`}
                                onClick={() => setTab('edit')}
                            >
                                Editar
                            </button>
                            <span className={tabStyles.sep}>·</span>
                            <button
                                className={`${tabStyles.tab} ${tabStyles.tabDelete} ${tab === 'delete' ? tabStyles.tabActive : ''}`}
                                onClick={() => setTab('delete')}
                            >
                                Excluir
                            </button>
                        </div>
                    </div>
                    <button className={styles.closeBtn} onClick={onClose} aria-label="Fechar">
                        <IconClose />
                    </button>
                </div>

                {tab === 'edit' ? (
                    <>
                        <div className={tabStyles.editBody}>
                            {editError && (
                                <div className={tabStyles.errorBanner}>
                                    <IconWarn />
                                    {editError}
                                </div>
                            )}
                            <label className={styles.field}>
                                <span className={styles.fieldLabel}>Nome da sprint</span>
                                <input
                                    type="text"
                                    className={styles.input}
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    maxLength={50}
                                />
                            </label>
                            <div className={tabStyles.dates}>
                                <label className={styles.field}>
                                    <span className={styles.fieldLabel}>Data de início</span>
                                    <input type="date" className={styles.input} value={startDate} onChange={e => setStartDate(e.target.value)} />
                                </label>
                                <label className={styles.field}>
                                    <span className={styles.fieldLabel}>Data final</span>
                                    <input type="date" className={styles.input} value={endDate} onChange={e => setEndDate(e.target.value)} />
                                </label>
                            </div>
                            <label className={styles.field}>
                                <span className={styles.fieldLabel}>Status</span>
                                <select className={styles.input} value={status} onChange={e => setStatus(e.target.value as SprintStatus)}>
                                    {STATUS_OPTIONS.map(o => (
                                        <option key={o.value} value={o.value}>{o.label}</option>
                                    ))}
                                </select>
                            </label>
                        </div>
                        <div className={styles.footer}>
                            <button type="button" className={styles.cancelBtn} onClick={onClose}>Cancelar</button>
                            <button type="button" className={styles.submitBtn} onClick={handleSave} disabled={editLoading}>
                                {editLoading ? 'Salvando...' : 'Salvar'}
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <div className={tabStyles.editBody}>
                            <div className={tabStyles.deleteWarning}>
                                <IconWarn />
                                <div>
                                    <p className={tabStyles.deleteText}>
                                        Tem certeza que deseja excluir a sprint <strong>{sprint.nome}</strong>?
                                        Essa ação não pode ser desfeita e as atividades associadas perderão o vínculo com esta sprint.
                                    </p>
                                    {deleteError && <p className={tabStyles.errorText}>{deleteError}</p>}
                                </div>
                            </div>
                        </div>
                        <div className={styles.footer}>
                            <button type="button" className={styles.cancelBtn} onClick={onClose}>Cancelar</button>
                            <button type="button" className={tabStyles.deleteBtn} onClick={handleDelete} disabled={deleteLoading}>
                                {deleteLoading ? 'Excluindo...' : 'Excluir sprint'}
                            </button>
                        </div>
                    </>
                )}

                <div className={styles.accentBarBottom} />
            </div>
        </div>
    );
}
