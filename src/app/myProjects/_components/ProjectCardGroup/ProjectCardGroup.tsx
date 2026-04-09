"use client";

import styles from './ProjectCardGroup.module.css';
import { ProjectCard } from '../ProjectCard/ProjectCard';
import { Project } from '@/src/types/project';

const IconPlus = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19"/>
        <line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
);

interface ProjectGridProps {
    projects: Project[];
    onProjectClick?: (project: Project) => void;
    onProjectMenuClick?: (project: Project) => void;
    onNewProject?: () => void;
}

export function ProjectCardGroup({
    projects,
    onProjectClick,
    onProjectMenuClick,
    onNewProject,
}: ProjectGridProps) {
    return (
        <div className={styles.grid}>
        {projects.map(project => (
            <ProjectCard
            key={project.id}
            project={project}
            onClick={onProjectClick}
            onMenuClick={onProjectMenuClick}
            />
        ))}

        <button className={styles.newCard} onClick={onNewProject}>
            <div className={styles.newIcon}>
            <IconPlus />
            </div>
            <span className={styles.newLabel}>Criar novo projeto</span>
            <span className={styles.newSub}>Você será Scrum Master automaticamente</span>
        </button>
        </div>
    );
}