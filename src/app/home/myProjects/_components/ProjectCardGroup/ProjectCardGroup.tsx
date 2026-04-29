"use client";

import styles from './ProjectCardGroup.module.css';
import { ProjectCard, ProjectMenuAction } from '../ProjectCard/ProjectCard';
import { Project } from '@/src/types/project';
import PlusIcon from '@/src/assets/icons/PlusIcon/PlusIcon';

interface ProjectGridProps {
    projects: Project[];
    onProjectClick?: (project: Project) => void;
    onProjectMenuClick?: (project: Project, action: ProjectMenuAction) => void;
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
            <PlusIcon size={15} />
            </div>
            <span className={styles.newLabel}>Criar novo projeto</span>
            <span className={styles.newSub}>Você será Scrum Master automaticamente</span>
        </button>
        </div>
    );
}
