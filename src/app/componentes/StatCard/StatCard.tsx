"use client";

import styles from './StatCard.module.css';

interface StatCardProps {
    label: string;
    value: string | number;
    sub?: string;
    showActiveDot?: boolean;
}

export function StatCard({ label, value, sub, showActiveDot = false }: StatCardProps) {
    return (
        <div className={styles.card}>
        <span className={styles.label}>{label}</span>
        <span className={styles.value}>{value}</span>
        {sub && (
            <span className={styles.sub}>
            {showActiveDot && <span className={styles.dot} />}
            {sub}
            </span>
        )}
        </div>
    );
}