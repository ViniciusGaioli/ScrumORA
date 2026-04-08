
"use client";

import { useState } from 'react';
import { FilterChip } from '../FilterChip/FilterChip';
import styles from './FilterChipGroup.module.css';

interface FilterOption {
    value: string;
    label: string;
}

interface FilterChipGroupProps {
    options: FilterOption[];
    defaultValue?: string;
    onChange?: (value: string) => void;
}

export function FilterChipGroup({ options, defaultValue, onChange }: FilterChipGroupProps) {
    const [active, setActive] = useState(defaultValue ?? options[0]?.value);

    function handleClick(value: string) {
        setActive(value);
        onChange?.(value);
    }

    return (
        <div className={styles.group}>
        {options.map(option => (
            <FilterChip
            key={option.value}
            label={option.label}
            active={active === option.value}
            onClick={() => handleClick(option.value)}
            />
        ))}
        </div>
    );
}