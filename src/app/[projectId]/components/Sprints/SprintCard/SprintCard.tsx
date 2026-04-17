"use client";

import { useState } from 'react';
import styles from './SprintCard.module.css';
import { Activity, ActivityStatus } from '../../Kanban/ActivityCard/Activity';
import { ActivityCard } from '../../Kanban/ActivityCard/ActivityCard';
import {
    SprintStatusChart,
    SPRINT_STATUS_ORDER,
    SPRINT_STATUS_LABEL,
    SPRINT_STATUS_COLOR,
} from '../SprintStatusChart/SprintStatusChart';
import { CreateSprintModal } from '../CreateSprintModal/CreateSprintModal';

export interface SprintGroupData {
    id: number;
    name: string;
    description?: string;
    activities: Activity[];
}

interface SprintCardProps {
    sprint: SprintGroupData;
    allActivities: Activity[];
    canEdit?: boolean;
}

function countByStatus(activities: Activity[]): Record<ActivityStatus, number> {
    const counts: Record<ActivityStatus, number> = {
        backlog: 0,
        development: 0,
        impediment: 0,
        approval: 0,
        done: 0,
    };
    for (const a of activities) {
        counts[a.status]++;
    }
    return counts;
}

export function SprintCard({ sprint, allActivities, canEdit = false }: SprintCardProps) {
    const [editing, setEditing] = useState(false);

    const counts = countByStatus(sprint.activities);
    const total = sprint.activities.length;

    return (
        <>
            <section
                className={styles.card}
                onClick={() => setEditing(true)}
                role="button"
                tabIndex={0}
                onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setEditing(true);
                    }
                }}
            >
                <div className={styles.accentBar} />
                <header className={styles.header}>
                    <div className={styles.titleGroup}>
                        <h2 className={styles.title}>Sprint {sprint.id} - {sprint.name}</h2>
                        {sprint.description && (
                            <p className={styles.description}>{sprint.description}</p>
                        )}
                    </div>
                    <span className={styles.count}>{total} atividade{total === 1 ? '' : 's'}</span>
                </header>

                <div className={styles.body}>
                    <aside className={styles.left}>
                        <SprintStatusChart counts={counts} total={total} />
                        <ul className={styles.legend}>
                            {SPRINT_STATUS_ORDER.map(status => (
                                <li key={status} className={styles.legendItem}>
                                    <span
                                        className={styles.legendDot}
                                        style={{ background: SPRINT_STATUS_COLOR[status] }}
                                    />
                                    <span className={styles.legendLabel}>{SPRINT_STATUS_LABEL[status]}</span>
                                    <span className={styles.legendCount}>{counts[status]}</span>
                                </li>
                            ))}
                        </ul>
                    </aside>

                    <div className={styles.right}>
                        {total === 0 ? (
                            <p className={styles.empty}>Nenhuma atividade nessa sprint.</p>
                        ) : (
                            SPRINT_STATUS_ORDER.map(status => {
                                const items = sprint.activities.filter(a => a.status === status);
                                if (items.length === 0) return null;
                                return (
                                    <div key={status} className={styles.group}>
                                        <div className={styles.groupHeader}>
                                            <span
                                                className={styles.groupDot}
                                                style={{ background: SPRINT_STATUS_COLOR[status] }}
                                            />
                                            <span className={styles.groupLabel}>{SPRINT_STATUS_LABEL[status]}</span>
                                            <span className={styles.groupCount}>{items.length}</span>
                                        </div>
                                        <div className={styles.cards}>
                                            {items.map(activity => (
                                                <ActivityCard
                                                    key={activity.id}
                                                    activity={activity}
                                                    canEdit={canEdit}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
                <div className={styles.accentBarBottom} />
            </section>

            {editing && (
                <CreateSprintModal
                    activities={allActivities}
                    sprint={{
                        id: sprint.id,
                        name: sprint.name,
                        description: sprint.description,
                        activityIds: sprint.activities.map(a => a.id),
                    }}
                    onClose={() => setEditing(false)}
                />
            )}
        </>
    );
}
