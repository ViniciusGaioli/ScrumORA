"use client";
import { useParams, usePathname } from 'next/navigation';
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

    const activeTab = TABS.find(tab => pathname.startsWith(`/${projectId}/${tab.href}`));
    const title = activeTab?.label ?? 'Projeto';

    return (
        <div className={styles.wrapper}>
            <Sidebar />
            <main className={styles.main}>
                <Header title={title} onSearch={() => console.log('buscar')} onNewProject={() => console.log('novo projeto')}/>
                <ProjectTabs projectId={projectId} />
                {children}
            </main>
        </div>
    );
}
