"use client";
import { useEffect, useState } from 'react';
import styles from './ThemeToggle.module.css';
import SunIcon from '@/src/assets/icons/SunIcon/SunIcon';
import MoonIcon from '@/src/assets/icons/MoonIcon/MoonIcon';

type Theme = 'light' | 'dark';

export function ThemeToggle() {
    const [theme, setTheme] = useState<Theme>('light');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem('scrumora-theme') as Theme | null;
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const initial: Theme = stored ?? (prefersDark ? 'dark' : 'light');
        setTheme(initial);
        document.documentElement.dataset.theme = initial;
        setMounted(true);
    }, []);

    const toggle = () => {
        const next: Theme = theme === 'dark' ? 'light' : 'dark';
        setTheme(next);
        document.documentElement.dataset.theme = next;
        localStorage.setItem('scrumora-theme', next);
    };

    const isDark = mounted && theme === 'dark';
    const label = isDark ? 'Mudar para modo claro' : 'Mudar para modo escuro';

    return (
        <button className={`${styles.track} ${isDark ? styles.dark : ''}`} onClick={toggle} aria-label={label} title={label}>
            <span className={`${styles.thumb}`} />
            <span className={styles.icon + ' ' + styles.iconSun}  aria-hidden="true"><SunIcon /></span>
            <span className={styles.icon + ' ' + styles.iconMoon} aria-hidden="true"><MoonIcon /></span>
        </button>
    );
}
