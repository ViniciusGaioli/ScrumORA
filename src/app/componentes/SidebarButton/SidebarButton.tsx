import React from "react";
import style from "./SidebarButton.module.css"


interface SidebarButtonProps {
    icon: React.ReactNode;
    label: string;
    active?: boolean;
    onClick?: () => void;
}

export function SidebarButton({icon, label, active = false, onClick}: SidebarButtonProps) {
    return (
        <button className={`${style.button} ${active ? style.active : ''}`} onClick={onClick} title={label} aria-label={label}>
            <span className={`${style.icon}`}>{icon}</span>
        </button>
    );
}