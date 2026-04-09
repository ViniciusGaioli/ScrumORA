// src/components/sidebar/Sidebar.tsx
"use client";

import { SidebarButton } from '../SidebarButton/SidebarButton';
import { ThemeToggle } from '../ThemeToggle/ThemeToggle';
import styles from './Sidebar.module.css';
import BellIcon from '../../assets/BellIcon/BellIcon';
import ProjectsIcon from '../../assets/ProjectsIcon/ProjectsIcon';
import SettingsIcon from '../../assets/SettingIcon/SettingsIcon';
import LeaveIcon from '../../assets/LeaveIcon/LeaveIcon';

type ActivePage = 'projects' | 'notifications' | 'settings';

interface SidebarProps {activePage?: ActivePage; userInitials?: string; onNavigate?: (page: ActivePage) => void; onLogout?: () => void;}

export function Sidebar({activePage = 'projects', userInitials = 'VG', onNavigate, onLogout,}: SidebarProps) {
    return (
        <aside className={styles.sidebar}>
            <div className={styles.logo}>SO</div>

            <nav className={styles.nav}>
                <SidebarButton
                icon={<ProjectsIcon />}
                label="Projetos"
                active={activePage === 'projects'}
                onClick={() => onNavigate?.('projects')}
                />
                <SidebarButton
                icon={<BellIcon />}
                label="Notificações"
                active={activePage === 'notifications'}
                onClick={() => onNavigate?.('notifications')}
                />
                <SidebarButton
                icon={<SettingsIcon />}
                label="Configurações"
                active={activePage === 'settings'}
                onClick={() => onNavigate?.('settings')}
                />
            </nav>

            <div className={styles.bottom}>
                <ThemeToggle />
                <SidebarButton
                icon={<LeaveIcon />}
                label="Sair"
                onClick={onLogout}
                />
                <div className={styles.avatar} title="Minha conta">
                {userInitials}
                </div>
            </div>
        </aside>
    );
}