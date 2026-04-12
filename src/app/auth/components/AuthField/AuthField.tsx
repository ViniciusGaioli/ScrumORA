"use client";
import styles from './AuthField.module.css';

interface AuthFieldProps {
    label: string;
    type?: string;
    placeholder?: string;
    value: string;
    onChange: (value: string) => void;
    error?: string;
}

export function AuthField({ label, type = 'text', placeholder, value, onChange, error }: AuthFieldProps) {
    return (
        <div className={styles.field}>
        <label className={styles.label}>{label}</label>
        <input className={`${styles.input} ${error ? styles.inputError : ''}`} type={type} placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)}/>
        {error && <span className={styles.error}>{error}</span>}
        </div>
    );
}
