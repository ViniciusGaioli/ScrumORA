"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import styles from './SprintSection.module.css';
import { Activity, ActivityStatus } from '../../Kanban/ActivityCard/Activity';
import { ActivityCard, ActivityMenuAction } from '../../Kanban/ActivityCard/ActivityCard';
import { SprintStatusChart, SPRINT_STATUS_ORDER, SPRINT_STATUS_LABEL, SPRINT_STATUS_COLOR } from '../SprintStatusChart/SprintStatusChart';
import { CreateActivityModal } from '../../Kanban/CreateActivityModal/CreateActivityModal';
import { EditActivityModal } from '../../Kanban/EditActivityModal/EditActivityModal';
import { ApiSprintInfo } from '../../../services/activityService';
import { Member, ProjectTeam } from '../../Team/MemberCard/Member';
import PlusIcon from '@/src/assets/icons/PlusIcon/PlusIcon';

function formatDate(d: string) {
    return new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

const STATUS_LABEL: Record<string, string> = {
    planejada:    'Planejada',
    em_andamento: 'Em andamento',
    concluida:    'Concluída',
    cancelada:    'Cancelada',
};

const STATUS_COLOR: Record<string, string> = {
    planejada:    'var(--color-status-backlog)',
    em_andamento: 'var(--color-status-development)',
    concluida:    'var(--color-status-done)',
    cancelada:    'var(--color-status-impediment)',
};

const IconMore = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/>
    </svg>
);

type CreateTarget = { status: ActivityStatus; sprintId?: number };
export type SprintMenuAction = 'edit' | 'delete';

interface SprintSectionProps {
    sprint: ApiSprintInfo;
    sprintActivities: Activity[];
    productBacklog: Activity[];
    projectId: string;
    members: Member[];
    teams: ProjectTeam[];
    canEdit?: boolean;
    onRefresh: () => void;
    onSprintMenuClick?: (sprint: ApiSprintInfo, action: SprintMenuAction) => void;
}

export function SprintSection({ sprint, sprintActivities, productBacklog, projectId, members, teams, canEdit = false, onRefresh, onSprintMenuClick }: SprintSectionProps) {
    const [createTarget, setCreateTarget] = useState<CreateTarget | null>(null);
    const [editTarget, setEditTarget] = useState<{ activity: Activity; tab: 'edit' | 'delete' } | null>(null);
    const [sprintMenuOpen, setSprintMenuOpen] = useState(false);
    const sprintMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!sprintMenuOpen) return;
        function handleClickOutside(e: MouseEvent) {
            if (sprintMenuRef.current && !sprintMenuRef.current.contains(e.target as Node)) {
                setSprintMenuOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [sprintMenuOpen]);

    function handleSprintAction(action: SprintMenuAction) {
        setSprintMenuOpen(false);
        onSprintMenuClick?.(sprint, action);
    }

    function handleMenuClick(activity: Activity, action: ActivityMenuAction) {
        setEditTarget({ activity, tab: action === 'delete' ? 'delete' : 'edit' });
    }

    const backlog = sprintActivities.filter(a => a.status !== 'done');
    const concluded = sprintActivities.filter(a => a.status === 'done');

    const pbDrop = useDroppable({ id: `pbcol__${sprint.id}` });
    const sbDrop = useDroppable({ id: `sbcol__${sprint.id}` });
    const ccDrop = useDroppable({ id: `cccol__${sprint.id}` });

    const pbItemIds = useMemo(() => productBacklog.map(a => `${sprint.id}__${a.id}`), [productBacklog, sprint.id]);
    const sbItemIds = useMemo(() => backlog.map(a => `${sprint.id}__${a.id}`), [backlog, sprint.id]);
    const ccItemIds = useMemo(() => concluded.map(a => `${sprint.id}__${a.id}`), [concluded, sprint.id]);

    const counts = {
        backlog: sprintActivities.filter(a => a.status === 'backlog').length,
        development: sprintActivities.filter(a => a.status === 'development').length,
        impediment: sprintActivities.filter(a => a.status === 'impediment').length,
        approval: sprintActivities.filter(a => a.status === 'approval').length,
        done: concluded.length,
    };

    const total = sprintActivities.length;
    const accent = STATUS_COLOR[sprint.status] ?? 'var(--color-brand)';

    return (
        <>
            <section className={styles.section} style={{ '--accent': accent } as React.CSSProperties}>
                <div className={styles.accentBar} />

                <header className={styles.header}>
                    <div className={styles.titleGroup}>
                        <h2 className={styles.title}>{sprint.nome}</h2>
                        <div className={styles.meta}>
                            <span className={styles.statusPill} style={{ background: `${accent}20`, color: accent }}>
                                {STATUS_LABEL[sprint.status] ?? sprint.status}
                            </span>
                            <span className={styles.dates}>
                                {formatDate(sprint.dataInicio)} → {formatDate(sprint.dataFim)}
                            </span>
                        </div>
                    </div>
                    <div className={styles.headerRight}>
                        <div className={styles.chartGroup}>
                            <SprintStatusChart counts={counts} total={total} size={72} />
                            <ul className={styles.legend}>
                                {SPRINT_STATUS_ORDER.map(status => (
                                    <li key={status} className={styles.legendItem}>
                                        <span className={styles.legendDot} style={{ background: SPRINT_STATUS_COLOR[status] }} />
                                        <span className={styles.legendLabel}>{SPRINT_STATUS_LABEL[status]}</span>
                                        <span className={styles.legendCount}>{counts[status]}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        {canEdit && (
                            <div className={styles.menuWrap} ref={sprintMenuRef}>
                                <button
                                    className={styles.menuBtn}
                                    onClick={() => setSprintMenuOpen(v => !v)}
                                    aria-label="Opções da sprint"
                                >
                                    <IconMore />
                                </button>
                                {sprintMenuOpen && (
                                    <div className={styles.dropdown}>
                                        <button className={styles.dropdownItem} onClick={() => handleSprintAction('edit')}>Editar</button>
                                        <button className={`${styles.dropdownItem} ${styles.dropdownItemDelete}`} onClick={() => handleSprintAction('delete')}>Excluir</button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </header>

                <div className={styles.board}>
                    <div className={styles.column}>
                        <div className={styles.columnHeader}>
                            <span className={styles.columnTitle}>Product Backlog</span>
                            <span className={styles.columnCount}>{productBacklog.length}</span>
                        </div>
                        <div ref={pbDrop.setNodeRef} className={`${styles.cardsGrid} ${pbDrop.isOver ? styles.cardsOver : ''}`}>
                            <SortableContext items={pbItemIds} strategy={verticalListSortingStrategy}>
                                {productBacklog.map(a => (
                                    <ActivityCard key={a.id} activity={a} groupId={String(sprint.id)} canEdit={canEdit} onMenuClick={handleMenuClick} />
                                ))}
                            </SortableContext>
                            {productBacklog.length === 0 && (
                                <p className={styles.empty} style={{ gridColumn: '1 / -1' }}>Nenhuma atividade no backlog.</p>
                            )}
                            {canEdit && (
                                <button className={styles.addBtn} style={{ gridColumn: '1 / -1' }} onClick={() => setCreateTarget({ status: 'backlog' })}>
                                    <PlusIcon size={11} />
                                    Criar nova atividade
                                </button>
                            )}
                        </div>
                    </div>

                    <div className={styles.column}>
                        <div className={styles.columnHeader}>
                            <span className={styles.columnTitle}>Sprint Backlog</span>
                            <span className={styles.columnCount}>{backlog.length}</span>
                        </div>
                        <div ref={sbDrop.setNodeRef} className={`${styles.cardsGrid} ${sbDrop.isOver ? styles.cardsOver : ''}`}>
                            <SortableContext items={sbItemIds} strategy={verticalListSortingStrategy}>
                                {backlog.map(a => (
                                    <ActivityCard key={a.id} activity={a} groupId={String(sprint.id)} canEdit={canEdit} onMenuClick={handleMenuClick} />
                                ))}
                            </SortableContext>
                            {backlog.length === 0 && (
                                <p className={styles.empty} style={{ gridColumn: '1 / -1' }}>Nenhuma atividade em andamento.</p>
                            )}
                            {canEdit && (
                                <button className={styles.addBtn} style={{ gridColumn: '1 / -1' }} onClick={() => setCreateTarget({ status: 'backlog', sprintId: sprint.id })}>
                                    <PlusIcon size={11} />
                                    Criar nova atividade
                                </button>
                            )}
                        </div>
                    </div>

                    <div className={styles.column}>
                        <div className={styles.columnHeader}>
                            <span className={styles.columnTitle}>Concluídas</span>
                            <span className={styles.columnCount}>{concluded.length}</span>
                        </div>
                        <div ref={ccDrop.setNodeRef} className={`${styles.cardsGrid} ${ccDrop.isOver ? styles.cardsOver : ''}`}>
                            <SortableContext items={ccItemIds} strategy={verticalListSortingStrategy}>
                                {concluded.map(a => (
                                    <ActivityCard key={a.id} activity={a} groupId={String(sprint.id)} canEdit={canEdit} onMenuClick={handleMenuClick} />
                                ))}
                            </SortableContext>
                            {concluded.length === 0 && (
                                <p className={styles.empty} style={{ gridColumn: '1 / -1' }}>Nenhuma atividade concluída.</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className={styles.accentBarBottom} />
            </section>

            {createTarget && (
                <CreateActivityModal
                    projectId={projectId}
                    status={createTarget.status}
                    sprintId={createTarget.sprintId}
                    members={members}
                    teams={teams}
                    onClose={() => setCreateTarget(null)}
                    onCreated={() => { onRefresh(); setCreateTarget(null); }}
                />
            )}

            {editTarget && (
                <EditActivityModal
                    activity={editTarget.activity}
                    projectId={projectId}
                    members={members}
                    teams={teams}
                    initialTab={editTarget.tab}
                    onClose={() => setEditTarget(null)}
                    onSaved={() => { onRefresh(); setEditTarget(null); }}
                />
            )}
        </>
    );
}
