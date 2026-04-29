"use client";
import { useEffect, useState } from 'react';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { Sidebar } from "../components/Sidebar/Sidebar";
import { ProjectTabs } from "./components/ProjectTabs/ProjectTabs";
import { Header } from '../components/Header/Header';
import styles from "./ProjectLayout.module.css";

const TABS = [
    { label: 'Atividades',  href: 'activities' },
    { label: 'Sprints',     href: 'sprints'    },
    { label: 'Integrantes', href: 'members'    },
    { label: 'Equipes',     href: 'team'       },
    { label: 'Progresso',   href: 'progress'  },
];

export default function ProjectLayout({ children }: { children: React.ReactNode }) {
    const { projectId } = useParams<{ projectId: string }>();
    const pathname = usePathname();
    const router = useRouter();
    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (!token) { router.replace('/auth/login'); return; }

        fetch(`${process.env.NEXT_PUBLIC_API_URL}/projetos/${projectId}/membros`, {
            headers: { Authorization: `Bearer ${token}` },
        }).then(res => {
            if (res.ok) {
                setAuthorized(true);
            } else {
                router.replace('/home/myProjects');
            }
        }).catch(() => router.replace('/home/myProjects'));
    }, [projectId]);

    const activeTab = TABS.find(tab => pathname.startsWith(`/${projectId}/${tab.href}`));
    const title = activeTab?.label ?? 'Projeto';

    function handleLogout() {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('userName');
        router.replace('/auth/login');
    }

    if (!authorized) return null;

    return (
        <div className={styles.wrapper}>
            <Sidebar onLogout={handleLogout} />
            <main className={styles.main}>
                <Header title={title} onSearch={() => console.log('buscar')} onNewProject={() => console.log('novo projeto')}/>
                <ProjectTabs projectId={projectId} />
                {children}
            </main>
        </div>
    );
}
