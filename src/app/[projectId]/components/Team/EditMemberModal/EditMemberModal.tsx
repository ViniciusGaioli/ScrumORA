"use client";

import { useEffect, useState } from 'react';
import styles from '../../Kanban/CreateActivityModal/CreateActivityModal.module.css';
import tabStyles from './EditMemberModal.module.css';
import { Member, MemberRole } from '../MemberCard/Member';

const IconClose = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
);

const ROLE_LABEL: Record<MemberRole, string> = {
    scrum_master:  'Scrum Master',
    product_owner: 'Product Owner',
    member:        'Integrante',
};

const ROLE_TO_PAPEL: Record<MemberRole, string> = {
    scrum_master:  'scrum_master',
    product_owner: 'product_owner',
    member:        'developer',
};

type Tab = 'edit' | 'remove';

type AffectedActivity = { id: number; name: string };

interface EditMemberModalProps {
    member: Member;
    projectId: string;
    initialTab?: Tab;
    onClose: () => void;
    onSaved: () => void;
}

export function EditMemberModal({ member, projectId, initialTab = 'edit', onClose, onSaved }: EditMemberModalProps) {
    const [tab, setTab] = useState<Tab>(initialTab);
    const [role, setRole] = useState<MemberRole>(member.role);
    const [editError, setEditError] = useState('');
    const [editLoading, setEditLoading] = useState(false);
    const [editSaved, setEditSaved] = useState(false);

    const [affectedActivities, setAffectedActivities] = useState<AffectedActivity[]>([]);
    const [removeError, setRemoveError] = useState('');
    const [removeLoading, setRemoveLoading] = useState(false);

    useEffect(() => {
        if (tab !== 'remove') return;
        const token = localStorage.getItem('accessToken');
        if (!token) return;

        fetch(`${process.env.NEXT_PUBLIC_API_URL}/projetos/${projectId}/atividades`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(r => r.ok ? r.json() : [])
            .then((data: { id: number; nome: string; responsaveis: { usuario?: { id: number } }[] }[]) => {
                const affected = data.filter(a =>
                    a.responsaveis?.some(r => r.usuario?.id === member.id)
                ).map(a => ({ id: a.id, name: a.nome }));
                setAffectedActivities(affected);
            });
    }, [tab, projectId, member.id]);

    async function handleSave() {
        setEditError('');
        setEditLoading(true);
        try {
            const token = localStorage.getItem('accessToken');
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/projetos/${projectId}/membros/${member.id}`,
                {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                    body: JSON.stringify({ papel: ROLE_TO_PAPEL[role] }),
                },
            );
            if (!res.ok) {
                const data = await res.json();
                setEditError(data.message ?? 'Erro ao salvar.');
                return;
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

    async function handleRemove() {
        setRemoveError('');
        setRemoveLoading(true);
        try {
            const token = localStorage.getItem('accessToken');
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/projetos/${projectId}/membros/${member.id}`,
                { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } },
            );
            if (!res.ok && res.status !== 204) {
                const data = await res.json();
                setRemoveError(data.message ?? 'Erro ao remover.');
                return;
            }
            onSaved();
            onClose();
        } catch {
            setRemoveError('Não foi possível conectar ao servidor.');
        } finally {
            setRemoveLoading(false);
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
            >
                <div className={styles.accentBar} />

                <div className={styles.header}>
                    <div>
                        <h2 className={styles.title}>{member.name}</h2>
                        <div className={tabStyles.tabRow}>
                            <span className={styles.statusTag}>
                                <span className={styles.statusDot} />
                                {ROLE_LABEL[member.role]}
                            </span>
                            <span className={tabStyles.sep}>·</span>
                            <button className={`${tabStyles.tab} ${tab === 'edit' ? tabStyles.tabActive : ''}`} onClick={() => setTab('edit')}>Editar</button>
                            <button className={`${tabStyles.tab} ${tab === 'remove' ? tabStyles.tabActive : ''} ${tabStyles.tabDelete}`} onClick={() => setTab('remove')}>Remover</button>
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
                                    <span className={styles.fieldLabel}>Papel no projeto</span>
                                    <select className={styles.input} value={role} onChange={e => { setRole(e.target.value as MemberRole); setEditSaved(false); }}>
                                        <option value="scrum_master">Scrum Master</option>
                                        <option value="product_owner">Product Owner</option>
                                        <option value="member">Integrante</option>
                                    </select>
                                </label>
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

                {tab === 'remove' && (
                    <>
                        <div className={styles.body}>
                            <div className={tabStyles.removeWarning}>
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                                    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                                </svg>
                                <p className={tabStyles.removeText}>
                                    Remover <strong>{member.name}</strong> do projeto. Esta ação é irreversível.
                                </p>
                            </div>

                            {affectedActivities.length > 0 && (
                                <div className={tabStyles.activitiesWarning}>
                                    <p className={tabStyles.activitiesLabel}>
                                        Este integrante é responsável por {affectedActivities.length} {affectedActivities.length === 1 ? 'atividade' : 'atividades'} e será removido delas automaticamente:
                                    </p>
                                    <ul className={tabStyles.activitiesList}>
                                        {affectedActivities.map(a => (
                                            <li key={a.id} className={tabStyles.activityItem}>{a.name}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {removeError && <p className={tabStyles.errorText}>{removeError}</p>}
                        </div>
                        <div className={styles.footer}>
                            <button type="button" className={styles.cancelBtn} onClick={onClose}>Cancelar</button>
                            <button type="button" className={tabStyles.removeBtn} onClick={handleRemove} disabled={removeLoading}>
                                {removeLoading ? 'Removendo...' : 'Remover do projeto'}
                            </button>
                        </div>
                    </>
                )}

                <div className={styles.accentBarBottom} />
            </div>
        </div>
    );
}
