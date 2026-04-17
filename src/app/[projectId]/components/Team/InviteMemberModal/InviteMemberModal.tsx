"use client";

import { useState } from 'react';
import styles from './InviteMemberModal.module.css';

const IconClose = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"/>
        <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
);

interface InviteMemberModalProps {
    onClose: () => void;
}

export function InviteMemberModal({ onClose }: InviteMemberModalProps) {
    const [email, setEmail] = useState('');

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
                    <h2 id="invite-member-title" className={styles.title}>
                        Convidar novo integrante ao projeto
                    </h2>
                    <button className={styles.closeBtn} onClick={onClose} aria-label="Fechar">
                        <IconClose />
                    </button>
                </div>

                <div className={styles.body}>
                    <label className={styles.field}>
                        <span className={styles.fieldLabel}>E-mail do integrante</span>
                        <input
                            type="email"
                            className={styles.input}
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="exemplo@dominio.com"
                            autoFocus
                        />
                    </label>
                </div>

                <div className={styles.footer}>
                    <button type="button" className={styles.cancelBtn} onClick={onClose}>
                        Cancelar
                    </button>
                    <button type="button" className={styles.submitBtn}>
                        Enviar convite
                    </button>
                </div>

                <div className={styles.accentBarBottom} />
            </div>
        </div>
    );
}
