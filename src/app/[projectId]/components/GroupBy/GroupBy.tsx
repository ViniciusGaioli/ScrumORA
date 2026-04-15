"use client";

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import styles from './GroupBy.module.css';

interface GroupByOption {
    value: string;
    label: string;
}

interface GroupByProps {
    options: GroupByOption[];
    paramKey?: string;
    defaultValue?: string;
}

export function GroupBy({ options, paramKey = 'group', defaultValue }: GroupByProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const current = searchParams.get(paramKey) ?? defaultValue ?? options[0]?.value;

    function handleClick(value: string) {
        const params = new URLSearchParams(searchParams.toString());
        params.set(paramKey, value);
        router.replace(`${pathname}?${params.toString()}`);
    }

    return (
        <div className={styles.wrapper}>
        <span className={styles.label}>Agrupar por</span>
        <div className={styles.options}>
            {options.map(option => (
            <button
                key={option.value}
                className={`${styles.btn} ${current === option.value ? styles.active : ''}`}
                onClick={() => handleClick(option.value)}
            >
                {option.label}
            </button>
            ))}
        </div>
        </div>
    );
    }