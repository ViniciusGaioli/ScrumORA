"use client";
import { useParams } from 'next/navigation';
import { Sidebar } from "../components/Sidebar/Sidebar";
import { ProjectTabs } from "./components/ProjectTabs/ProjectTabs";
import styles from "./ProjectLayout.module.css";

export default function ProjectLayout({ children }: { children: React.ReactNode }) {
    const { projectId } = useParams<{ projectId: string }>();

    return (
        <div className={styles.wrapper}>
            <Sidebar />
            <main className={styles.main}>
                <ProjectTabs projectId={projectId} />
                {children}
            </main>
        </div>
    );
}
