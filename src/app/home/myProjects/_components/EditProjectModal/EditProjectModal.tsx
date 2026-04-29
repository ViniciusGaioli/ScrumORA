"use client";

import { useState, useEffect } from 'react';
import styles from './EditProjectModal.module.css';
import { Project } from '@/src/types/project';

const IconClose = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
);

const IconCopy = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
    </svg>
);

type Tab = 'edit' | 'share' | 'delete';

interface EditProjectModalProps {
    project: Project;
    initialTab?: Tab;
    onClose: () => void;
    onRefresh: () => void;
}

export function EditProjectModal({ project, initialTab = 'edit', onClose, onRefresh }: EditProjectModalProps) {
    const [tab, setTab] = useState<Tab>(initialTab);

    useEffect(() => {
        if (initialTab === 'share') handleGenerateLink();
    }, []);

    const [name, setName] = useState(project.name);
    const [description, setDescription] = useState(project.description);
    const [editError, setEditError] = useState('');
    const [editLoading, setEditLoading] = useState(false);
    const [editSaved, setEditSaved] = useState(false);

    const [inviteLink, setInviteLink] = useState('');
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteError, setInviteError] = useState('');
    const [inviteLoading, setInviteLoading] = useState(false);
    const [linkLoading, setLinkLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [emailSent, setEmailSent] = useState(false);

    const [deleteError, setDeleteError] = useState('');
    const [deleteLoading, setDeleteLoading] = useState(false);

    async function handleSave() {
        if (!name.trim() || !description.trim()) {
            setEditError('Preencha todos os campos.');
            return;
        }
        setEditError('');
        setEditLoading(true);
        try {
            const token = localStorage.getItem('accessToken');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/projetos/${project.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ nome: name.trim(), descricao: description.trim() }),
            });
            if (!res.ok) {
                const data = await res.json();
                setEditError(data.message ?? 'Erro ao salvar.');
                return;
            }
            onRefresh();
            setEditSaved(true);
            setTimeout(() => setEditSaved(false), 2000);
        } catch {
            setEditError('Não foi possível conectar ao servidor.');
        } finally {
            setEditLoading(false);
        }
    }

    async function handleGenerateLink() {
        setLinkLoading(true);
        try {
            const token = localStorage.getItem('accessToken');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/projetos/${project.id}/convites`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({}),
            });
            if (res.ok) {
                const data = await res.json();
                setInviteLink(data.link);
            }
        } finally {
            setLinkLoading(false);
        }
    }

    async function handleSendEmail() {
        if (!inviteEmail.trim()) return;
        setInviteError('');
        setEmailSent(false);
        setInviteLoading(true);
        try {
            const token = localStorage.getItem('accessToken');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/projetos/${project.id}/convites`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ email: inviteEmail.trim() }),
            });
            if (!res.ok) {
                const data = await res.json();
                setInviteError(data.message ?? 'Erro ao enviar convite.');
                return;
            }
            setInviteEmail('');
            setEmailSent(true);
        } catch {
            setInviteError('Não foi possível conectar ao servidor.');
        } finally {
            setInviteLoading(false);
        }
    }

    function handleCopy() {
        navigator.clipboard.writeText(inviteLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    async function handleDelete() {
        setDeleteError('');
        setDeleteLoading(true);
        try {
            const token = localStorage.getItem('accessToken');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/projetos/${project.id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok && res.status !== 204) {
                const data = await res.json();
                setDeleteError(data.message ?? 'Erro ao excluir projeto.');
                return;
            }
            onRefresh();
            onClose();
        } catch {
            setDeleteError('Não foi possível conectar ao servidor.');
        } finally {
            setDeleteLoading(false);
        }
    }

    function handleTabChange(next: Tab) {
        setTab(next);
        if (next === 'share' && !inviteLink) handleGenerateLink();
    }

    return (
        <div className={styles.backdrop} onClick={onClose} role="presentation">
            <div
                className={styles.modal}
                onClick={e => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="edit-project-title"
            >
                <div className={styles.accentBar} />

                <div className={styles.header}>
                    <div>
                        <h2 id="edit-project-title" className={styles.title}>{project.name}</h2>
                        <div className={styles.tabs}>
                            <button className={`${styles.tab} ${tab === 'edit' ? styles.tabActive : ''}`} onClick={() => handleTabChange('edit')}>Editar</button>
                            <button className={`${styles.tab} ${tab === 'share' ? styles.tabActive : ''}`} onClick={() => handleTabChange('share')}>Compartilhar</button>
                            <button className={`${styles.tab} ${tab === 'delete' ? styles.tabActive : ''} ${styles.tabDelete}`} onClick={() => handleTabChange('delete')}>Excluir</button>
                        </div>
                    </div>
                    <button className={styles.closeBtn} onClick={onClose} aria-label="Fechar">
                        <IconClose />
                    </button>
                </div>

                {tab === 'edit' && (
                    <>
                        <div className={styles.body}>
                            {editError && (
                                <div className={styles.errorBanner}>
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                                        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                                    </svg>
                                    {editError}
                                </div>
                            )}
                            <label className={styles.field}>
                                <span className={styles.fieldLabel}>Nome do projeto</span>
                                <input type="text" className={styles.input} value={name} onChange={e => { setName(e.target.value); setEditSaved(false); }} maxLength={50} />
                            </label>
                            <label className={styles.field}>
                                <span className={styles.fieldLabel}>Descrição</span>
                                <textarea className={styles.textarea} value={description} onChange={e => { setDescription(e.target.value); setEditSaved(false); }} rows={4} maxLength={255} />
                            </label>
                        </div>
                        <div className={styles.footer}>
                            <button type="button" className={styles.cancelBtn} onClick={onClose}>Cancelar</button>
                            <button type="button" className={styles.submitBtn} onClick={handleSave} disabled={editLoading}>
                                {editSaved ? 'Salvo!' : editLoading ? 'Salvando...' : 'Salvar alterações'}
                            </button>
                        </div>
                    </>
                )}

                {tab === 'share' && (
                    <>
                        <div className={styles.body}>
                            <div className={styles.section}>
                                <span className={styles.fieldLabel}>Link de convite</span>
                                <p className={styles.hint}>Compartilhe este link com quem quiser convidar. Expira em 7 dias.</p>
                                {inviteLink ? (
                                    <div className={styles.linkRow}>
                                        <span className={styles.linkText}>{inviteLink}</span>
                                        <button type="button" className={styles.copyBtn} onClick={handleCopy}>
                                            <IconCopy />{copied ? 'Copiado!' : 'Copiar'}
                                        </button>
                                    </div>
                                ) : (
                                    <button type="button" className={styles.generateBtn} onClick={handleGenerateLink} disabled={linkLoading}>
                                        {linkLoading ? 'Gerando...' : 'Gerar link'}
                                    </button>
                                )}
                            </div>
                            <div className={styles.divider} />
                            <div className={styles.section}>
                                <span className={styles.fieldLabel}>Convidar por e-mail</span>
                                <div className={styles.emailRow}>
                                    <input type="email" className={styles.input} value={inviteEmail} onChange={e => { setInviteEmail(e.target.value); setEmailSent(false); }} placeholder="email@exemplo.com" />
                                    <button type="button" className={styles.sendBtn} onClick={handleSendEmail} disabled={inviteLoading || !inviteEmail.trim()}>
                                        {inviteLoading ? '...' : 'Enviar'}
                                    </button>
                                </div>
                                {emailSent && <p className={styles.successText}>Convite enviado!</p>}
                                {inviteError && <p className={styles.errorText}>{inviteError}</p>}
                            </div>
                        </div>
                        <div className={styles.footer}>
                            <button type="button" className={styles.submitBtn} onClick={onClose}>Concluir</button>
                        </div>
                    </>
                )}

                {tab === 'delete' && (
                    <>
                        <div className={styles.body}>
                            <div className={styles.deleteWarning}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                                </svg>
                                <p className={styles.deleteText}>
                                    Você está prestes a excluir o projeto <strong>"{project.name}"</strong>. Esta ação é irreversível e removerá todos os dados, sprints e atividades associadas.
                                </p>
                            </div>
                            {deleteError && <p className={styles.errorText}>{deleteError}</p>}
                        </div>
                        <div className={styles.footer}>
                            <button type="button" className={styles.cancelBtn} onClick={onClose}>Cancelar</button>
                            <button type="button" className={styles.deleteBtn} onClick={handleDelete} disabled={deleteLoading}>
                                {deleteLoading ? 'Excluindo...' : 'Excluir projeto'}
                            </button>
                        </div>
                    </>
                )}

                <div className={styles.accentBarBottom} />
            </div>
        </div>
    );
}
