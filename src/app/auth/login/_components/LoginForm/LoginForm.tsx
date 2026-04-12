"use client";
import styles from './LoginForm.module.css';
import { useState } from 'react';
import { AuthField } from '../../../components/AuthField/AuthField';
import { AuthGoogleButton } from '../../../components/AuthGoogleButton/AuthGoogleButton';

interface LoginFormProps {
    onLogin?: (email: string, password: string) => void;
    onGoogleLogin?: () => void;
    onForgotPassword?: () => void;
    onRegister?: () => void;
}

export function LoginForm({ onLogin, onGoogleLogin, onForgotPassword, onRegister }: LoginFormProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    function handleSubmit() {
        if (!email || !password) {
            setError('Preencha todos os campos obrigatórios.');
            return;
        }
        setError('');
        onLogin?.(email, password);
    }

    return (
        <div className={styles.wrapper}>
        <div className={styles.header}>
            <h2 className={styles.title}>Bem-vindo de volta</h2>
            <p className={styles.subtitle}>Entre com sua conta para continuar</p>
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
        </div>

        <button className={styles.forgot} onClick={onForgotPassword}>
            Esqueci minha senha
        </button>

        <button className={styles.btnPrimary} onClick={handleSubmit}>
            Entrar
        </button>

        <div className={styles.divider}>
            <div className={styles.dividerLine} />
            <span className={styles.dividerText}>ou continue com</span>
            <div className={styles.dividerLine} />
        </div>

        <AuthGoogleButton onClick={onGoogleLogin} text="Entrar com Google" />

        <p className={styles.footer}>
            Não tem uma conta?{' '}
            <button className={styles.footerLink} onClick={onRegister}>
            Cadastre-se
            </button>
        </p>
        </div>
    );
}
