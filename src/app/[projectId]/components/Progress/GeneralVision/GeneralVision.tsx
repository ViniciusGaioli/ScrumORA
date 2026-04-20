import styles from './GeneralVision.module.css';
import { Activity, ActivityStatus } from '../../Kanban/ActivityCard/Activity';
import {
    SPRINT_STATUS_ORDER,
    SPRINT_STATUS_LABEL,
    SPRINT_STATUS_COLOR,
} from '../../Sprints/SprintStatusChart/SprintStatusChart';

interface GeneralVisionProps {
    activities: Activity[];
    currentSprint?: {
        id: number;
        name: string;
        endDate?: string;
    };
}

function daysUntil(endDateStr: string): number {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const end = new Date(endDateStr);
    end.setHours(0, 0, 0, 0);
    return Math.round((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export function GeneralVision({ activities, currentSprint }: GeneralVisionProps) {
    const total = activities.length;

    const counts: Record<ActivityStatus, number> = {
        backlog: 0,
        development: 0,
        impediment: 0,
        approval: 0,
        done: 0,
    };
    for (const a of activities) counts[a.status]++;

    const donePct = total > 0 ? Math.round((counts.done / total) * 100) : 0;

    const daysLeft = currentSprint?.endDate ? daysUntil(currentSprint.endDate) : null;
    const daysLabel =
        daysLeft === null ? '—'
        : daysLeft > 0 ? `${daysLeft}`
        : daysLeft === 0 ? 'hoje'
        : `${Math.abs(daysLeft)} atrás`;

    return (
        <section className={styles.section}>
            <header className={styles.header}>
                <h2 className={styles.title}>Visão geral</h2>
            </header>

            <div className={styles.topRow}>
                <article className={styles.mainStat}>
                    <span className={styles.statLabel}>Total de atividades</span>
                    <span className={styles.statValue}>{total}</span>
                </article>

                <article className={styles.mainStat}>
                    <span className={styles.statLabel}>Percentual concluído</span>
                    <span className={styles.statValue}>{donePct}%</span>
                    <div className={styles.progressTrack}>
                        <div
                            className={styles.progressFill}
                            style={{ width: `${donePct}%` }}
                        />
                    </div>
                </article>

                <article className={styles.mainStat}>
                    <span className={styles.statLabel}>
                        Dias restantes {currentSprint ? `— ${currentSprint.name}` : ''}
                    </span>
                    <span className={styles.statValue}>{daysLabel}</span>
                    {daysLeft !== null && daysLeft < 0 && (
                        <span className={styles.statHint}>sprint encerrada</span>
                    )}
                </article>
            </div>

            <ul className={styles.statusList}>
                {SPRINT_STATUS_ORDER.map(status => (
                    <li key={status} className={styles.statusItem}>
                        <span
                            className={styles.statusDot}
                            style={{ background: SPRINT_STATUS_COLOR[status] }}
                        />
                        <span className={styles.statusLabel}>{SPRINT_STATUS_LABEL[status]}</span>
                        <span className={styles.statusCount}>{counts[status]}</span>
                    </li>
                ))}
            </ul>
        </section>
    );
}
