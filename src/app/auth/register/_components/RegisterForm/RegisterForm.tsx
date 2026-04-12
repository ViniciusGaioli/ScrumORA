"use client";
import styles from './RegisterForm.module.css';
import { useState } from 'react';
import { AuthField } from '../../../components/AuthField/AuthField';
import { AuthGoogleButton } from '../../../components/AuthGoogleButton/AuthGoogleButton';

interface RegisterFormProps {
    onRegister?: (name: string, email: string, password: string) => void;
    onGoogleRegister?: () => void;
    onLogin?: () => void;
}

export function RegisterForm({ onRegister, onGoogleRegister, onLogin }: RegisterFormProps) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [error, setError] = useState('');

    function handleSubmit() {
        if (!name || !email || !password || !confirm) {
            setError('Preencha todos os campos obrigatórios.');
            return;
        }
        if (password !== confirm) {
            setError('As senhas não coincidem.');
            return;
        }
        setError('');
        onRegister?.(name, email, password);
    }

    return (
        <div className={styles.wrapper}>
        <div className={styles.header}>
            <h2 className={styles.title}>Crie sua conta</h2>
            <p className={styles.subtitle}>Comece a gerenciar seus projetos hoje</p>
        </div>

        {error && (
            <div className={styles.errorBanner}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {error}
            </div>
        )}

        <div className={styles.fields}>
            <AuthField
                label="Nome completo"
                placeholder="Seu nome"
                value={name}
                onChange={setName}
            />
            <AuthField
                label="E-mail"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={setEmail}
            />
            <AuthField
                label="Senha"
                type="password"
                placeholder="Mínimo 8 caracteres"
                value={password}
                onChange={setPassword}
            />
            <AuthField
                label="Confirmar senha"
                type="password"
                placeholder="Repita a senha"
                value={confirm}
                onChange={setConfirm}
            />
        </div>

        <button className={styles.btnPrimary} onClick={handleSubmit}>
            Criar conta
        </button>

        <div className={styles.divider}>
            <div className={styles.dividerLine} />
            <span className={styles.dividerText}>ou continue com</span>
            <div className={styles.dividerLine} />
        </div>

        <AuthGoogleButton onClick={onGoogleRegister} text="Cadastrar com Google" />

        <p className={styles.footer}>
            Já tem uma conta?{' '}
            <button className={styles.footerLink} onClick={onLogin}>
            Entrar
            </button>
        </p>
        </div>
    );
}
