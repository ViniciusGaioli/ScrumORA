"use client";

import styles from './FilterChip.module.css';

interface FilterChipProps {
    label: string;
    active?: boolean;
    onClick?: () => void;
}

export function FilterChip({ label, active = false, onClick }: FilterChipProps) {
    return (
        <button className={`${styles.chip} ${active ? styles.active : ''}`} onClick={onClick}>
            {active && <span className={styles.dot} />}
            {label}
        </button>
    );
}