"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './ProjectTabs.module.css';

const TABS = [
    { label: 'Atividades',  href: 'activities'  },
    { label: 'Sprints',     href: 'sprints'     },
    { label: 'Integrantes', href: 'members' },
    { label: 'Equipes',     href: 'team'     },
    { label: 'Progresso',   href: 'progresso'   },
];

interface ProjectTabsProps {
    projectId: string;
}

export function ProjectTabs({ projectId }: ProjectTabsProps) {
    const pathname = usePathname();

    return (
        <nav className={styles.nav}>
        {TABS.map(tab => {
            const href = `/${projectId}/${tab.href}`;
            const active = pathname.startsWith(href);

            return (
                <Link key={tab.href} href={href} className={`${styles.tab} ${active ? styles.active : ''}`}>{tab.label}</Link>
            );
        })}
        </nav>
    );
}