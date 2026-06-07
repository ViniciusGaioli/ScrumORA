"use client";

import { useEffect, useRef, useState } from 'react';
import styles from '../../Kanban/CreateActivityModal/CreateActivityModal.module.css';
import { MemberCard } from '../MemberCard/MemberCard';
import { Member } from '../MemberCard/Member';
import CloseIcon from '@/src/assets/icons/CloseIcon/CloseIcon';
import SearchIcon from '@/src/assets/icons/SearchIcon/SearchIcon';

interface CreateTeamModalProps {
    projectId: string;
    members: Member[];
    onClose: () => void;
    onCreated: () => void;
}

export function CreateTeamModal({ projectId, members, onClose, onCreated }: CreateTeamModalProps) {
    const [name, setName] = useState('');
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
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

    const selectedMembers = members.filter(m => selectedIds.includes(m.id));
    const suggestions = members.filter(m =>
        !selectedIds.includes(m.id) &&
        m.name.toLowerCase().includes(search.toLowerCase())
    );

    const addMember = (id: number) => { setSelectedIds(prev => [...prev, id]); setSearch(''); };
    const removeMember = (member: Member) => setSelectedIds(prev => prev.filter(id => id !== member.id));

    async function handleSubmit() {
        if (!name.trim()) {
            setError('Informe o nome da equipe.');
            return;
        }
        setError('');
        setLoading(true);
        try {
            const token = localStorage.getItem('accessToken');

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/projetos/${projectId}/equipes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ nome: name.trim() }),
            });
            if (!res.ok) {
                const data = await res.json();
                setError(data.message ?? 'Erro ao criar equipe.');
                return;
            }
            const equipe = await res.json();

            await Promise.all(selectedIds.map(userId =>
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/projetos/${projectId}/equipes/${equipe.id}/membros/${userId}`, {
                    method: 'POST',
                    headers: { Authorization: `Bearer ${token}` },
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
                aria-labelledby="create-team-title"
            >
                <div className={styles.accentBar} />

                <div className={styles.header}>
                    <h2 id="create-team-title" className={styles.title}>Criar nova equipe</h2>
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
                            <span className={styles.fieldLabel}>Nome da equipe</span>
                            <input
                                type="text"
                                className={styles.input}
                                value={name}
                                onChange={e => setName(e.target.value)}
                                placeholder="Ex.: Backend, Frontend, QA"
                                maxLength={50}
                            />
                        </label>
                    </div>

                    <div className={styles.right}>
                        <div className={styles.rightHeader}>
                            <span className={styles.sectionTitle}>Integrantes</span>
                            <div className={styles.searchWrap} ref={searchWrapRef}>
                                {!searchOpen ? (
                                    <button
                                        type="button"
                                        className={styles.searchToggle}
                                        onClick={() => setSearchOpen(true)}
                                        aria-label="Adicionar integrante"
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
                                            placeholder="Buscar integrante"
                                            autoFocus
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
                                    </>
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
                    <button type="button" className={styles.submitBtn} onClick={handleSubmit} disabled={loading}>
                        {loading ? 'Criando...' : 'Criar equipe'}
                    </button>
                </div>

                <div className={styles.accentBarBottom} />
            </div>
        </div>
    );
}
