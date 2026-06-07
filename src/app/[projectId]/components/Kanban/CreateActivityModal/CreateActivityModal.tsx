"use client";

import { useEffect, useRef, useState } from 'react';
import styles from './CreateActivityModal.module.css';
import { MemberCard } from '../../Team/MemberCard/MemberCard';
import { TeamResponsibleCard } from '../../Team/TeamResponsibleCard/TeamResponsibleCard';
import { Member, ProjectTeam } from '../../Team/MemberCard/Member';
import { ActivityStatus } from '../ActivityCard/Activity';
import CloseIcon from '@/src/assets/icons/CloseIcon/CloseIcon';
import SearchIcon from '@/src/assets/icons/SearchIcon/SearchIcon';
import TeamIcon from '@/src/assets/icons/TeamIcon/TeamIcon';

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

const memberKey = (id: number) => `u:${id}`;
const teamKey = (id: number) => `t:${id}`;

interface CreateActivityModalProps {
    projectId: string;
    status: ActivityStatus;
    members: Member[];
    teams: ProjectTeam[];
    sprintId?: number;
    onClose: () => void;
    onCreated: () => void;
}

export function CreateActivityModal({ projectId, status, members, teams, sprintId, onClose, onCreated }: CreateActivityModalProps) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [search, setSearch] = useState('');
    const [searchOpen, setSearchOpen] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
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

    const accent = STATUS_COLOR[status];

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

    async function handleSubmit() {
        if (!name.trim() || !description.trim() || !startDate || !endDate) {
            setError('Preencha todos os campos obrigatórios.');
            return;
        }
        setError('');
        setLoading(true);
        try {
            const token = localStorage.getItem('accessToken');
            const body: Record<string, unknown> = {
                nome: name.trim(),
                descricao: description.trim(),
                dataInicio: startDate,
                dataFim: endDate,
                etapa: STATUS_TO_ETAPA[status],
            };
            if (sprintId !== undefined) body.sprintId = sprintId;

            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/projetos/${projectId}/atividades`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                    body: JSON.stringify(body),
                },
            );
            if (!res.ok) {
                const data = await res.json();
                setError(data.message ?? 'Erro ao criar atividade.');
                return;
            }
            const created = await res.json();

            const usuarioIds = selectedIds.filter(k => k.startsWith('u:')).map(k => Number(k.slice(2)));
            const equipeIds = selectedIds.filter(k => k.startsWith('t:')).map(k => Number(k.slice(2)));

            if (usuarioIds.length > 0 || equipeIds.length > 0) {
                await fetch(`${process.env.NEXT_PUBLIC_API_URL}/atividade-responsavel`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                    body: JSON.stringify({ atividadeId: created.id, usuarioIds, equipeIds }),
                });
            }

            onCreated();
            onClose();
        } catch {
            setError('Não foi possível conectar ao servidor.');
        } finally {
            setLoading(false);
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
                        <CloseIcon />
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
                            <span className={styles.fieldLabel}>Nome da atividade</span>
                            <input
                                type="text"
                                className={styles.input}
                                value={name}
                                onChange={e => setName(e.target.value)}
                                placeholder="Dê um nome à atividade"
                                maxLength={50}
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
                                maxLength={255}
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
                            <div className={styles.searchWrap} ref={searchWrapRef}>
                                {!searchOpen ? (
                                    <button
                                        type="button"
                                        className={styles.searchToggle}
                                        onClick={() => setSearchOpen(true)}
                                        aria-label="Adicionar responsável"
                                    >
                                        <SearchIcon size={13} />
                                        <span>Adicionar</span>
                                    </button>
                                ) : (
                                    <>
                                        <span className={styles.searchIcon}><SearchIcon size={13} /></span>
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
                                                        <button
                                                            type="button"
                                                            className={styles.suggestionItem}
                                                            onClick={() => addSelection(memberKey(m.id))}
                                                        >
                                                            <span className={styles.suggestionInitials}>{m.initials}</span>
                                                            <span>{m.name}</span>
                                                        </button>
                                                    </li>
                                                ))}
                                                {teamSuggestions.map(t => (
                                                    <li key={`t-${t.id}`}>
                                                        <button
                                                            type="button"
                                                            className={styles.suggestionItem}
                                                            onClick={() => addSelection(teamKey(t.id))}
                                                        >
                                                            <span className={styles.suggestionInitials} style={{ background: 'var(--color-brand)' }}>
                                                                <TeamIcon />
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
                                            <MemberCard
                                                key={key}
                                                member={member}
                                                canEdit
                                                onMenuClick={removeMember}
                                            />
                                        );
                                    }
                                    const team = selectedTeams.find(t => teamKey(t.id) === key);
                                    if (!team) return null;
                                    const teamMembers = members.filter(m => m.teamIds.includes(team.id));
                                    return (
                                        <TeamResponsibleCard
                                            key={key}
                                            team={team}
                                            members={teamMembers}
                                            canEdit
                                            onRemove={removeTeam}
                                        />
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                <div className={styles.footer}>
                    <button type="button" className={styles.cancelBtn} onClick={onClose}>
                        Cancelar
                    </button>
                    <button type="button" className={styles.submitBtn} onClick={handleSubmit} disabled={loading}>
                        {loading ? 'Criando...' : 'Criar atividade'}
                    </button>
                </div>

                <div className={styles.accentBarBottom} />
            </div>
        </div>
    );
}
