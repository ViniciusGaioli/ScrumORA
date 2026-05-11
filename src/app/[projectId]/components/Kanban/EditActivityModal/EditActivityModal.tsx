"use client";

import { useEffect, useRef, useState } from 'react';
import styles from '../CreateActivityModal/CreateActivityModal.module.css';
import tabStyles from './EditActivityModal.module.css';
import { MemberCard } from '../../Team/MemberCard/MemberCard';
import { TeamResponsibleCard } from '../../Team/TeamResponsibleCard/TeamResponsibleCard';
import { Member, ProjectTeam } from '../../Team/MemberCard/Member';
import { Activity, ActivityStatus } from '../ActivityCard/Activity';
import { fetchActivityResponsibles } from '../../../services/activityService';

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

const IconTeam = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="7" width="13" height="13" rx="2"/>
        <path d="M8 7V5a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v12"/>
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

const memberKey = (id: number) => `u:${id}`;
const teamKey = (id: number) => `t:${id}`;

type Tab = 'edit' | 'delete';

type ArEntry = { id: number; key: string };

interface EditActivityModalProps {
    activity: Activity;
    projectId: string;
    members: Member[];
    teams: ProjectTeam[];
    initialTab?: Tab;
    onClose: () => void;
    onSaved: () => void;
}

export function EditActivityModal({ activity, projectId, members, teams, initialTab = 'edit', onClose, onSaved }: EditActivityModalProps) {
    const [tab, setTab] = useState<Tab>(initialTab);

    const [name, setName] = useState(activity.name);
    const [description, setDescription] = useState(activity.description);
    const [startDate, setStartDate] = useState(activity.startDate?.slice(0, 10) ?? '');
    const [endDate, setEndDate] = useState(activity.endDate?.slice(0, 10) ?? '');
    const [status, setStatus] = useState<ActivityStatus>(activity.status);
    const initialSelected = activity.responsibles.flatMap(r => {
        if (r.user) return [`u:${r.user.id}`];
        if (r.team) return [`t:${r.team.id}`];
        return [];
    });
    const [selectedIds, setSelectedIds] = useState<string[]>(initialSelected);
    const [search, setSearch] = useState('');
    const [searchOpen, setSearchOpen] = useState(false);
    const [currentAr, setCurrentAr] = useState<ArEntry[]>([]);
    const searchWrapRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!searchOpen) return;
        function handleClickOutside(e: MouseEvent) {
            if (searchWrapRef.current && !searchWrapRef.current.contains(e.target as Node)) {
                setSearchOpen(false);
                setSearch('');
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [searchOpen]);

    const [editError, setEditError] = useState('');
    const [editLoading, setEditLoading] = useState(false);
    const [editSaved, setEditSaved] = useState(false);

    const [deleteError, setDeleteError] = useState('');
    const [deleteLoading, setDeleteLoading] = useState(false);

    const accent = STATUS_COLOR[status];

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (!token) return;
        fetchActivityResponsibles(activity.id, token).then(rows => {
            const entries: ArEntry[] = rows.map(r => {
                if (r.userId !== undefined) return { id: r.id, key: memberKey(r.userId) };
                if (r.teamId !== undefined) return { id: r.id, key: teamKey(r.teamId) };
                return { id: r.id, key: '' };
            }).filter(e => e.key !== '');
            setCurrentAr(entries);
        });
    }, [activity.id]);

    const selectedMembers = members.filter(m => selectedIds.includes(memberKey(m.id)));
    const selectedTeams = teams.filter(t => selectedIds.includes(teamKey(t.id)));

    const memberSuggestions = members.filter(m =>
        !selectedIds.includes(memberKey(m.id)) &&
        m.name.toLowerCase().includes(search.toLowerCase())
    );
    const teamSuggestions = teams.filter(t =>
        !selectedIds.includes(teamKey(t.id)) &&
        t.name.toLowerCase().includes(search.toLowerCase())
    );

    const addSelection = (key: string) => {
        setSelectedIds(prev => [...prev, key]);
        setSearch('');
    };

    const removeMember = (member: Member) => {
        setSelectedIds(prev => prev.filter(k => k !== memberKey(member.id)));
    };

    const removeTeam = (team: { id: number; name: string }) => {
        setSelectedIds(prev => prev.filter(k => k !== teamKey(team.id)));
    };

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

            const currentKeys = currentAr.map(ar => ar.key);
            const toRemove = currentAr.filter(ar => !selectedIds.includes(ar.key));
            const toAdd = selectedIds.filter(k => !currentKeys.includes(k));

            await Promise.all(toRemove.map(ar =>
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/atividade-responsavel/${ar.id}`, {
                    method: 'DELETE',
                    headers: { Authorization: `Bearer ${token}` },
                })
            ));

            const usuarioIds = toAdd.filter(k => k.startsWith('u:')).map(k => Number(k.slice(2)));
            const equipeIds = toAdd.filter(k => k.startsWith('t:')).map(k => Number(k.slice(2)));

            if (usuarioIds.length > 0 || equipeIds.length > 0) {
                await fetch(`${process.env.NEXT_PUBLIC_API_URL}/atividade-responsavel`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                    body: JSON.stringify({ atividadeId: activity.id, usuarioIds, equipeIds }),
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

    const hasSuggestions = memberSuggestions.length > 0 || teamSuggestions.length > 0;

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
                                    <div className={styles.searchWrap} ref={searchWrapRef}>
                                        {!searchOpen ? (
                                            <button
                                                type="button"
                                                className={styles.searchToggle}
                                                onClick={() => setSearchOpen(true)}
                                                aria-label="Adicionar responsável"
                                            >
                                                <IconSearch />
                                                <span>Adicionar</span>
                                            </button>
                                        ) : (
                                            <>
                                                <span className={styles.searchIcon}><IconSearch /></span>
                                                <input
                                                    type="text"
                                                    className={styles.searchInput}
                                                    value={search}
                                                    onChange={e => setSearch(e.target.value)}
                                                    onKeyDown={e => { if (e.key === 'Escape') { setSearchOpen(false); setSearch(''); } }}
                                                    placeholder="Buscar integrante ou equipe"
                                                    autoFocus
                                                />
                                                {hasSuggestions && (
                                                    <ul className={styles.suggestions}>
                                                        {memberSuggestions.map(m => (
                                                            <li key={`u-${m.id}`}>
                                                                <button type="button" className={styles.suggestionItem} onClick={() => addSelection(memberKey(m.id))}>
                                                                    <span className={styles.suggestionInitials}>{m.initials}</span>
                                                                    <span>{m.name}</span>
                                                                </button>
                                                            </li>
                                                        ))}
                                                        {teamSuggestions.map(t => (
                                                            <li key={`t-${t.id}`}>
                                                                <button type="button" className={styles.suggestionItem} onClick={() => addSelection(teamKey(t.id))}>
                                                                    <span className={styles.suggestionInitials} style={{ background: 'var(--color-brand)' }}>
                                                                        <IconTeam />
                                                                    </span>
                                                                    <span>{t.name}</span>
                                                                </button>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>
                                {selectedIds.length === 0 ? (
                                    <p className={styles.empty}>Nenhum responsável adicionado ainda.</p>
                                ) : (
                                    <div className={styles.responsiblesGrid}>
                                        {selectedIds.map(key => {
                                            if (key.startsWith('u:')) {
                                                const member = selectedMembers.find(m => memberKey(m.id) === key);
                                                if (!member) return null;
                                                return (
                                                    <MemberCard key={key} member={member} canEdit onMenuClick={removeMember} />
                                                );
                                            }
                                            const team = selectedTeams.find(t => teamKey(t.id) === key);
                                            if (!team) return null;
                                            const teamMembers = members.filter(m => m.teamIds.includes(team.id));
                                            return (
                                                <TeamResponsibleCard key={key} team={team} members={teamMembers} canEdit onRemove={removeTeam} />
                                            );
                                        })}
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
