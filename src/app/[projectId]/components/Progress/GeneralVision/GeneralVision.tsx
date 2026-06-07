import styles from './GeneralVision.module.css';
import { Activity, ActivityStatus } from '../../Kanban/ActivityCard/Activity';
import {
    SPRINT_STATUS_ORDER,
    SPRINT_STATUS_LABEL,
    SPRINT_STATUS_COLOR,
} from '../../Sprints/SprintStatusChart/SprintStatusChart';

interface GeneralVisionProps {
    activities: Activity[];
}

export function GeneralVision({ activities }: GeneralVisionProps) {
    const total = activities.length;

    const counts: Record<ActivityStatus, number> = {
        backlog: 0,
        development: 0,
        impediment: 0,
        approval: 0,
        done: 0,
    };
    for (const a of activities) counts[a.status]++;

    const openCount = total - counts.done;
    const doneCount = counts.done;
    const donePct = total > 0 ? Math.round((doneCount / total) * 100) : 0;

    return (
        <section className={styles.section}>
            <header className={styles.header}>
                <h2 className={styles.title}>Visão geral</h2>
            </header>

            <div className={styles.topRow}>
                <article className={styles.mainStat}>
                    <span className={styles.statLabel}>Atividades em aberto</span>
                    <span className={styles.statValue}>{openCount}</span>
                </article>

                <article className={styles.mainStat}>
                    <span className={styles.statLabel}>Atividades concluídas</span>
                    <span className={styles.statValue}>{doneCount}</span>
                    <div className={styles.progressTrack}>
                        <div
                            className={styles.progressFill}
                            style={{ width: `${donePct}%` }}
                        />
                    </div>
                </article>

                <article className={styles.mainStat}>
                    <span className={styles.statLabel}>Impedimentos</span>
                    <span className={styles.statValue}>{counts.impediment}</span>
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
