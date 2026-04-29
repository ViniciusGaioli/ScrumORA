"use client";

import { useState } from 'react';
import styles from './CreateProjectModal.module.css';

const IconClose = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"/>
        <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
);

const IconCopy = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
    </svg>
);

interface CreateProjectModalProps {
    onClose: () => void;
    onRefresh: () => void;
}

export function CreateProjectModal({ onClose, onRefresh }: CreateProjectModalProps) {
    const [step, setStep] = useState<1 | 2>(1);
    const [projetoId, setProjetoId] = useState<number | null>(null);
    const [inviteLink, setInviteLink] = useState('');

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [createError, setCreateError] = useState('');
    const [createLoading, setCreateLoading] = useState(false);

    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteError, setInviteError] = useState('');
    const [inviteLoading, setInviteLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [emailSent, setEmailSent] = useState(false);

    async function handleCreate() {
        if (!name.trim() || !description.trim()) {
            setCreateError('Preencha todos os campos.');
            return;
        }
        setCreateError('');
        setCreateLoading(true);
        try {
            const token = localStorage.getItem('accessToken');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/projetos`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ nome: name.trim(), descricao: description.trim() }),
            });
            if (!res.ok) {
                const data = await res.json();
                setCreateError(data.message ?? 'Erro ao criar projeto.');
                return;
            }
            const projeto = await res.json();
            setProjetoId(projeto.id);
            onRefresh();

            const linkRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/projetos/${projeto.id}/convites`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({}),
            });
            if (linkRes.ok) {
                const linkData = await linkRes.json();
                setInviteLink(linkData.link);
            }

            setStep(2);
        } catch {
            setCreateError('Não foi possível conectar ao servidor.');
        } finally {
            setCreateLoading(false);
        }
    }

    async function handleSendEmail() {
        if (!inviteEmail.trim()) return;
        setInviteError('');
        setEmailSent(false);
        setInviteLoading(true);
        try {
            const token = localStorage.getItem('accessToken');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/projetos/${projetoId}/convites`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
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

    return (
        <div className={styles.backdrop} onClick={onClose} role="presentation">
            <div
                className={styles.modal}
                onClick={e => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="create-project-title"
            >
                <div className={styles.accentBar} />

                <div className={styles.header}>
                    <div>
                        <h2 id="create-project-title" className={styles.title}>
                            {step === 1 ? 'Criar projeto' : 'Convidar membros'}
                        </h2>
                        <div className={styles.steps}>
                            <span className={`${styles.step} ${step === 1 ? styles.stepActive : styles.stepDone}`}>1. Projeto</span>
                            <span className={styles.stepSep}>→</span>
                            <span className={`${styles.step} ${step === 2 ? styles.stepActive : ''}`}>2. Convites</span>
                        </div>
                    </div>
                    <button className={styles.closeBtn} onClick={onClose} aria-label="Fechar">
                        <IconClose />
                    </button>
                </div>

                {step === 1 && (
                    <>
                        <div className={styles.body}>
                            {createError && (
                                <div className={styles.errorBanner}>
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                                        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                                    </svg>
                                    {createError}
                                </div>
                            )}
                            <label className={styles.field}>
                                <span className={styles.fieldLabel}>Nome do projeto</span>
                                <input
                                    type="text"
                                    className={styles.input}
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    placeholder="Ex.: Plataforma de Agendamento"
                                    maxLength={50}
                                />
                            </label>
                            <label className={styles.field}>
                                <span className={styles.fieldLabel}>Descrição</span>
                                <textarea
                                    className={styles.textarea}
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    placeholder="Descreva o objetivo do projeto"
                                    rows={4}
                                    maxLength={255}
                                />
                            </label>
                            <p className={styles.hint}>
                                Você será definido automaticamente como <strong>Scrum Master</strong> deste projeto.
                            </p>
                        </div>
                        <div className={styles.footer}>
                            <button type="button" className={styles.cancelBtn} onClick={onClose}>
                                Cancelar
                            </button>
                            <button type="button" className={styles.submitBtn} onClick={handleCreate} disabled={createLoading}>
                                {createLoading ? 'Criando...' : 'Criar e convidar →'}
                            </button>
                        </div>
                    </>
                )}

                {step === 2 && (
                    <>
                        <div className={styles.body}>
                            <div className={styles.section}>
                                <span className={styles.fieldLabel}>Link de convite</span>
                                <p className={styles.hint}>Compartilhe este link com quem quiser convidar. Expira em 7 dias.</p>
                                <div className={styles.linkRow}>
                                    <span className={styles.linkText}>{inviteLink}</span>
                                    <button type="button" className={styles.copyBtn} onClick={handleCopy}>
                                        <IconCopy />
                                        {copied ? 'Copiado!' : 'Copiar'}
                                    </button>
                                </div>
                            </div>

                            <div className={styles.divider} />

                            <div className={styles.section}>
                                <span className={styles.fieldLabel}>Convidar por e-mail</span>
                                <div className={styles.emailRow}>
                                    <input
                                        type="email"
                                        className={styles.input}
                                        value={inviteEmail}
                                        onChange={e => { setInviteEmail(e.target.value); setEmailSent(false); }}
                                        placeholder="email@exemplo.com"
                                    />
                                    <button type="button" className={styles.sendBtn} onClick={handleSendEmail} disabled={inviteLoading || !inviteEmail.trim()}>
                                        {inviteLoading ? '...' : 'Enviar'}
                                    </button>
                                </div>
                                {emailSent && <p className={styles.successText}>Convite enviado!</p>}
                                {inviteError && <p className={styles.errorText}>{inviteError}</p>}
                            </div>
                        </div>
                        <div className={styles.footer}>
                            <button type="button" className={styles.submitBtn} onClick={onClose}>
                                Concluir
                            </button>
                        </div>
                    </>
                )}

                <div className={styles.accentBarBottom} />
            </div>
        </div>
    );
}
