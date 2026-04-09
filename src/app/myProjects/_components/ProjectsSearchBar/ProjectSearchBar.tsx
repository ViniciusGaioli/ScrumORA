"use client";

import styles from './ProjectSearchBar.module.css';
import SearchIcon from '@/src/assets/icons/SearchIcon/SearchIcon';



interface SearchBarProps {
    placeholder?: string;
    value?: string;
    onChange?: (value: string) => void;
}

export function ProjectSearchBar({ placeholder = 'Buscar projeto...', value, onChange }: SearchBarProps) {
    return (
        <div className={styles.wrapper}>
            <span className={styles.icon}>
                <SearchIcon />
            </span>
            <input className={styles.input} type="text" placeholder={placeholder} value={value} onChange={e => onChange?.(e.target.value)}/>
        </div>
    );
}