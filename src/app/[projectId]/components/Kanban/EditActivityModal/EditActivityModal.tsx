"use client";

import { useEffect, useState } from 'react';
import styles from '../CreateActivityModal/CreateActivityModal.module.css';
import tabStyles from './EditActivityModal.module.css';
import { MemberCard } from '../../Team/MemberCard/MemberCard';
import { Member } from '../../Team/MemberCard/Member';
import { Activity, ActivityStatus } from '../ActivityCard/Activity';

const IconClose = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
);

const IconSearch = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
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

const STATUS_TO_ETAPA: Record<ActivityStatus, string> = {
    backlog:     'backlog',
    development: 'desenvolvimento',
    impediment:  'impedimento',
    approval:    'aprovacao',
    done:        'finalizada',
};

const STATUS_OPTIONS = Object.entries(STATUS_LABEL) as [ActivityStatus, string][];

type Tab = 'edit' | 'delete';

type ArEntry = { userId: number; arId: number };

interface EditActivityModalProps {
    activity: Activity;
    projectId: string;
    members: Member[];
    initialTab?: Tab;
    onClose: () => void;
    onSaved: () => void;
}

export function EditActivityModal({ activity, projectId, members, initialTab = 'edit', onClose, onSaved }: EditActivityModalProps) {
    const [tab, setTab] = useState<Tab>(initialTab);

    const [name, setName] = useState(activity.name);
    const [description, setDescription] = useState(activity.description);
    const [startDate, setStartDate] = useState(activity.startDate?.slice(0, 10) ?? '');
    const [endDate, setEndDate] = useState(activity.endDate?.slice(0, 10) ?? '');
    const [status, setStatus] = useState<ActivityStatus>(activity.status);
    const [selectedIds, setSelectedIds] = useState<number[]>(
        activity.responsibles.filter(r => r.user).map(r => r.user!.id)
    );
    const [search, setSearch] = useState('');
    const [currentAr, setCurrentAr] = useState<ArEntry[]>([]);

    const [editError, setEditError] = useState('');
    const [editLoading, setEditLoading] = useState(false);
    const [editSaved, setEditSaved] = useState(false);

    const [deleteError, setDeleteError] = useState('');
    const [deleteLoading, setDeleteLoading] = useState(false);

    const accent = STATUS_COLOR[status];

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (!token) return;
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/atividade-responsavel?atividadeId=${activity.id}`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(r => r.ok ? r.json() : [])
            .then((data: { id: number; usuario: { id: number } }[]) => {
                setCurrentAr(data.map(ar => ({ userId: ar.usuario.id, arId: ar.id })));
            });
    }, [activity.id]);

    const selectedMembers = members.filter(m => selectedIds.includes(m.id));
    const suggestions = members.filter(m =>
        !selectedIds.includes(m.id) &&
        m.name.toLowerCase().includes(search.toLowerCase())
    );

    const addMember = (id: number) => { setSelectedIds(prev => [...prev, id]); setSearch(''); };
    const removeMember = (member: Member) => setSelectedIds(prev => prev.filter(id => id !== member.id));

    async function handleSave() {
        if (!name.trim() || !description.trim() || !startDate || !endDate) {
            setEditError('Preencha todos os campos.');
            return;
        }
        setEditError('');
        setEditLoading(true);
        try {
            const token = localStorage.getItem('accessToken');

            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/projetos/${projectId}/atividades/${activity.id}`,
                {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                    body: JSON.stringify({
                        nome: name.trim(),
                        descricao: description.trim(),
                        dataInicio: startDate,
                        dataFim: endDate,
                        etapa: STATUS_TO_ETAPA[status],
                    }),
                },
            );
            if (!res.ok) {
                const data = await res.json();
                setEditError(data.message ?? 'Erro ao salvar.');
                return;
            }

            const currentIds = currentAr.map(ar => ar.userId);
            const toRemove = currentAr.filter(ar => !selectedIds.includes(ar.userId));
            const toAdd = selectedIds.filter(id => !currentIds.includes(id));

            await Promise.all(toRemove.map(ar =>
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/atividade-responsavel/${ar.arId}`, {
                    method: 'DELETE',
                    headers: { Authorization: `Bearer ${token}` },
                })
            ));

            if (toAdd.length > 0) {
                await fetch(`${process.env.NEXT_PUBLIC_API_URL}/atividade-responsavel`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                    body: JSON.stringify({ atividadeId: activity.id, usuarioIds: toAdd }),
                });
            }

            onSaved();
            setEditSaved(true);
            setTimeout(() => setEditSaved(false), 2000);
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
                `${process.env.NEXT_PUBLIC_API_URL}/projetos/${projectId}/atividades/${activity.id}`,
                { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } },
            );
            if (!res.ok && res.status !== 204) {
                const data = await res.json();
                setDeleteError(data.message ?? 'Erro ao excluir.');
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
                style={{ '--accent': accent } as React.CSSProperties}
                onClick={e => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
            >
                <div className={styles.accentBar} />

                <div className={styles.header}>
                    <div>
                        <h2 className={styles.title}>{activity.name}</h2>
                        <div className={tabStyles.tabRow}>
                            <span className={styles.statusTag}>
                                <span className={styles.statusDot} />
                                {STATUS_LABEL[activity.status]}
                            </span>
                            <span className={tabStyles.sep}>·</span>
                            <button className={`${tabStyles.tab} ${tab === 'edit' ? tabStyles.tabActive : ''}`} onClick={() => setTab('edit')}>Editar</button>
                            <button className={`${tabStyles.tab} ${tab === 'delete' ? tabStyles.tabActive : ''} ${tabStyles.tabDelete}`} onClick={() => setTab('delete')}>Excluir</button>
                        </div>
                    </div>
                    <button className={styles.closeBtn} onClick={onClose} aria-label="Fechar"><IconClose /></button>
                </div>

                {tab === 'edit' && (
                    <>
                        <div className={styles.body}>
                            <div className={styles.left}>
                                {editError && (
                                    <div className={styles.errorBanner}>
                                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                                            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                                        </svg>
                                        {editError}
                                    </div>
                                )}
                                <label className={styles.field}>
                                    <span className={styles.fieldLabel}>Nome da atividade</span>
                                    <input type="text" className={styles.input} value={name} onChange={e => { setName(e.target.value); setEditSaved(false); }} maxLength={50} />
                                </label>
                                <label className={styles.field}>
                                    <span className={styles.fieldLabel}>Descrição</span>
                                    <textarea className={styles.textarea} value={description} onChange={e => { setDescription(e.target.value); setEditSaved(false); }} rows={4} maxLength={255} />
                                </label>
                                <label className={styles.field}>
                                    <span className={styles.fieldLabel}>Status</span>
                                    <select className={styles.input} value={status} onChange={e => setStatus(e.target.value as ActivityStatus)}>
                                        {STATUS_OPTIONS.map(([val, label]) => <option key={val} value={val}>{label}</option>)}
                                    </select>
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
                                                        <button type="button" className={styles.suggestionItem} onClick={() => addMember(m.id)}>
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
                                            <MemberCard key={member.id} member={member} canEdit onMenuClick={removeMember} />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className={styles.footer}>
                            <button type="button" className={styles.cancelBtn} onClick={onClose}>Cancelar</button>
                            <button type="button" className={styles.submitBtn} onClick={handleSave} disabled={editLoading}>
                                {editSaved ? 'Salvo!' : editLoading ? 'Salvando...' : 'Salvar alterações'}
                            </button>
                        </div>
                    </>
                )}

                {tab === 'delete' && (
                    <>
                        <div className={styles.body}>
                            <div className={tabStyles.deleteWarning}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                                </svg>
                                <p className={tabStyles.deleteText}>
                                    Você está prestes a excluir a atividade <strong>"{activity.name}"</strong>. Esta ação é irreversível.
                                </p>
                            </div>
                            {deleteError && <p className={tabStyles.errorText}>{deleteError}</p>}
                        </div>
                        <div className={styles.footer}>
                            <button type="button" className={styles.cancelBtn} onClick={onClose}>Cancelar</button>
                            <button type="button" className={tabStyles.deleteBtn} onClick={handleDelete} disabled={deleteLoading}>
                                {deleteLoading ? 'Excluindo...' : 'Excluir atividade'}
                            </button>
                        </div>
                    </>
                )}

                <div className={styles.accentBarBottom} />
            </div>
        </div>
    );
}
