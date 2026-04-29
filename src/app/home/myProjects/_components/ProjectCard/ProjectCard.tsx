"use client";

import { useEffect, useRef, useState } from 'react';
import styles from './ProjectCard.module.css';
import { Project, UserRole } from '@/src/types/project';

export type ProjectMenuAction = 'edit' | 'share' | 'delete';

const IconMore = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/>
    </svg>
);

const ACCENT_BY_ROLE: Record<UserRole, string> = {
    scrum_master:  '#534AB7',
    product_owner: '#3B6D11',
    member:        '#854F0B',
};

const ROLE_LABEL: Record<UserRole, string> = {
    scrum_master:  'Scrum Master',
    product_owner: 'Product Owner',
    member:        'Integrante',
};

const ROLE_CLASS: Record<UserRole, string> = {
    scrum_master:  styles.roleSm,
    product_owner: styles.rolePo,
    member:        styles.roleInt,
};

const MAX_VISIBLE_AVATARS = 3;

interface ProjectCardProps {
    project: Project;
    onClick?: (project: Project) => void;
    onMenuClick?: (project: Project, action: ProjectMenuAction) => void;
}

export function ProjectCard({ project, onClick, onMenuClick }: ProjectCardProps) {
    const accent = ACCENT_BY_ROLE[project.role];
    const visibleMembers = project.members.slice(0, MAX_VISIBLE_AVATARS);
    const extraMembers = project.members.length - MAX_VISIBLE_AVATARS;
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!menuOpen) return;
        function handleClickOutside(e: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setMenuOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [menuOpen]);

    function handleAction(action: ProjectMenuAction) {
        setMenuOpen(false);
        onMenuClick?.(project, action);
    }

    return (
        <div
            className={styles.card}
            style={{ '--accent': accent } as React.CSSProperties}
            onClick={() => onClick?.(project)}
        >
            <div className={styles.accentBar} />

            <div className={styles.top}>
                <div className={styles.icon} style={{ background: `${accent}18`, color: accent }}>
                    {project.name.slice(0, 2).toUpperCase()}
                </div>
                <div className={styles.menuWrap} ref={menuRef}>
                    <button
                        className={styles.menuBtn}
                        onClick={e => { e.stopPropagation(); setMenuOpen(v => !v); }}
                        aria-label="Opções do projeto"
                    >
                        <IconMore />
                    </button>
                    {menuOpen && (
                        <div className={styles.dropdown} onClick={e => e.stopPropagation()}>
                            <button className={styles.dropdownItem} onClick={() => handleAction('edit')}>Editar</button>
                            <button className={styles.dropdownItem} onClick={() => handleAction('share')}>Compartilhar</button>
                            <button className={`${styles.dropdownItem} ${styles.dropdownItemDelete}`} onClick={() => handleAction('delete')}>Excluir</button>
                        </div>
                    )}
                </div>
            </div>

            <div className={styles.sprintTag}>
                <span className={`${styles.sprintDot} ${project.activeSprint ? styles.sprintDotActive : ''}`} />
                {project.activeSprint ? `${project.activeSprint.name} em andamento` : 'Sem sprint ativa'}
            </div>

            <p className={styles.name}>{project.name}</p>
            <p className={styles.description}>{project.description}</p>

            <div className={styles.meta}>
                <span className={`${styles.role} ${ROLE_CLASS[project.role]}`}>
                    {ROLE_LABEL[project.role]}
                </span>
                <div className={styles.avatars}>
                    {visibleMembers.map(member => (
                        <div key={member.id} className={styles.avatar} style={{ background: accent }} title={member.name}>
                            {member.initials}
                        </div>
                    ))}
                    {extraMembers > 0 && (
                        <div className={`${styles.avatar} ${styles.avatarExtra}`} title={`+${extraMembers} membros`}>
                            +{extraMembers}
                        </div>
                    )}
                </div>
            </div>

            <div className={styles.progress}>
                <div className={styles.progressBar}>
                    <div className={styles.progressFill} style={{ width: `${project.progress}%`, background: accent }} />
                </div>
                <div className={styles.progressLabels}>
                    <span className={styles.progressLabel}>Progresso</span>
                    <span className={styles.progressValue} style={{ color: accent }}>{project.progress}%</span>
                </div>
            </div>
        </div>
    );
}
