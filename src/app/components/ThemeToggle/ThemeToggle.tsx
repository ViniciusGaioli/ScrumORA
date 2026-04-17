"use client";
import { useTheme } from 'next-themes';
import styles from './ThemeToggle.module.css';
import SunIcon from '@/src/assets/icons/SunIcon/SunIcon';
import MoonIcon from '@/src/assets/icons/MoonIcon/MoonIcon';

export function ThemeToggle() {
    const { resolvedTheme, setTheme } = useTheme();

    const toggle = () => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
    const label = 'Alternar tema';

    return (
        <button className={styles.track} onClick={toggle} aria-label={label} title={label}>
            <span className={styles.thumb} />
            <span className={`${styles.icon} ${styles.iconSun}`}><SunIcon /></span>
            <span className={`${styles.icon} ${styles.iconMoon}`}><MoonIcon /></span>
        </button>
    );
}
