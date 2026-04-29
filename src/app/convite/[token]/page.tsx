"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import styles from './Page.module.css';

type Status = 'loading' | 'success' | 'error' | 'unauthenticated';

export default function AceitarConvitePage() {
    const { token } = useParams<{ token: string }>();
    const router = useRouter();
    const [status, setStatus] = useState<Status>('loading');
    const [message, setMessage] = useState('');

    useEffect(() => {
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
            setStatus('unauthenticated');
            return;
        }

        fetch(`${process.env.NEXT_PUBLIC_API_URL}/convites/${token}/aceitar`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${accessToken}` },
        })
            .then(async r => {
                const data = await r.json();
                if (!r.ok) throw new Error(data.message ?? 'Erro ao aceitar convite.');
                return data;
            })
            .then(() => {
                setStatus('success');
                setTimeout(() => router.replace('/home/myProjects'), 2000);
            })
            .catch(err => {
                setMessage(err.message);
                setStatus('error');
            });
    }, [token]);

    return (
        <div className={styles.page}>
            <div className={styles.card}>
                <div className={styles.logo}>ScrumORA</div>

                {status === 'loading' && (
                    <>
                        <div className={styles.spinner} />
                        <p className={styles.text}>Aceitando convite...</p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <div className={styles.iconSuccess}>
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12"/>
                            </svg>
                        </div>
                        <h1 className={styles.title}>Convite aceito!</h1>
                        <p className={styles.text}>Você foi adicionado ao projeto. Redirecionando...</p>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <div className={styles.iconError}>
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                            </svg>
                        </div>
                        <h1 className={styles.title}>Convite inválido</h1>
                        <p className={styles.text}>{message}</p>
                        <button className={styles.btn} onClick={() => router.replace('/home/myProjects')}>
                            Ir para meus projetos
                        </button>
                    </>
                )}

                {status === 'unauthenticated' && (
                    <>
                        <h1 className={styles.title}>Faça login primeiro</h1>
                        <p className={styles.text}>Você precisa estar logado para aceitar este convite.</p>
                        <button className={styles.btn} onClick={() => router.replace(`/auth/login?redirect=/convite/${token}`)}>
                            Fazer login
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
