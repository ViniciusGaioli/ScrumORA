"use client";
import styles from './Header.module.css';

interface HeaderProps {
    title?: string;
    onSearch?: () => void;
    onNewProject?: () => void;
}

export function Header({ title = 'Meus projetos', onSearch, onNewProject }: HeaderProps) {
    return (
        <header className={styles.header}>
        <span className={styles.title}>{title}</span>
        </header>
    );
}
