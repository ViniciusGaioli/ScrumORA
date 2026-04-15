"use client";

import { useEffect } from 'react';
import styles from './ProjectError.module.css';

interface ErrorProps {
    error: Error & { digest?: string };
    reset: () => void;
}

export default function ProjectError({ error, reset }: ErrorProps) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className={styles.wrapper}>
            <p className={styles.message}>Não foi possível carregar os dados do projeto.</p>
            <button className={styles.btn} onClick={reset}>Tentar novamente</button>
        </div>
    );
}
