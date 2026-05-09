"use client";

import { useEffect, useState } from 'react';
import styles from './InviteMemberModal.module.css';

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

interface InviteMemberModalProps {
    projectId: string;
    onClose: () => void;
}

export function InviteMemberModal({ projectId, onClose }: InviteMemberModalProps) {
    const [inviteLink, setInviteLink] = useState('');
    const [linkLoading, setLinkLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    const [email, setEmail] = useState('');
    const [emailLoading, setEmailLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);
    const [emailError, setEmailError] = useState('');

    useEffect(() => { handleGenerateLink(); }, []);

    async function handleGenerateLink() {
        setLinkLoading(true);
        try {
            const token = localStorage.getItem('accessToken');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/projetos/${projectId}/convites`, {
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

    function handleCopy() {
        navigator.clipboard.writeText(inviteLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    async function handleSendEmail() {
        if (!email.trim()) return;
        setEmailError('');
        setEmailSent(false);
        setEmailLoading(true);
        try {
            const token = localStorage.getItem('accessToken');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/projetos/${projectId}/convites`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ email: email.trim() }),
            });
            if (!res.ok) {
                const data = await res.json();
                setEmailError(data.message ?? 'Erro ao enviar convite.');
                return;
            }
            setEmail('');
            setEmailSent(true);
        } catch {
            setEmailError('Não foi possível conectar ao servidor.');
        } finally {
            setEmailLoading(false);
        }
    }

    return (
        <div className={styles.backdrop} onClick={onClose} role="presentation">
            <div
                className={styles.modal}
                onClick={e => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="invite-member-title"
            >
                <div className={styles.accentBar} />

                <div className={styles.header}>
                    <h2 id="invite-member-title" className={styles.title}>Convidar integrante</h2>
                    <button className={styles.closeBtn} onClick={onClose} aria-label="Fechar">
                        <IconClose />
                    </button>
                </div>

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
                            <div className={styles.linkRow}>
                                <span className={styles.linkText}>{linkLoading ? 'Gerando link...' : 'Falha ao gerar link.'}</span>
                            </div>
                        )}
                    </div>

                    <div className={styles.divider} />

                    <div className={styles.section}>
                        <span className={styles.fieldLabel}>Convidar por e-mail</span>
                        <div className={styles.emailRow}>
                            <input
                                type="email"
                                className={styles.input}
                                value={email}
                                onChange={e => { setEmail(e.target.value); setEmailSent(false); }}
                                placeholder="email@exemplo.com"
                                autoFocus
                            />
                            <button
                                type="button"
                                className={styles.sendBtn}
                                onClick={handleSendEmail}
                                disabled={emailLoading || !email.trim()}
                            >
                                {emailLoading ? '...' : 'Enviar'}
                            </button>
                        </div>
                        {emailSent && <p className={styles.successText}>Convite enviado!</p>}
                        {emailError && <p className={styles.errorText}>{emailError}</p>}
                    </div>
                </div>

                <div className={styles.footer}>
                    <button type="button" className={styles.submitBtn} onClick={onClose}>
                        Concluir
                    </button>
                </div>

                <div className={styles.accentBarBottom} />
            </div>
        </div>
    );
}
