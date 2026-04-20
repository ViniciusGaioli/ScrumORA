import styles from './StatusDistribution.module.css';
import { Activity, ActivityStatus } from '../../Kanban/ActivityCard/Activity';
import {
    SprintStatusChart,
    SPRINT_STATUS_ORDER,
    SPRINT_STATUS_LABEL,
    SPRINT_STATUS_COLOR,
} from '../../Sprints/SprintStatusChart/SprintStatusChart';

const NEAR_END_DAYS = 7;

interface StatusDistributionProps {
    activities: Activity[];
}

function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

function daysUntil(dateStr: string): number {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const end = new Date(dateStr);
    end.setHours(0, 0, 0, 0);
    return Math.round((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export function StatusDistribution({ activities }: StatusDistributionProps) {
    const counts: Record<ActivityStatus, number> = {
        backlog: 0,
        development: 0,
        impediment: 0,
        approval: 0,
        done: 0,
    };
    for (const a of activities) counts[a.status]++;
    const total = activities.length;

    const impediments = activities.filter(a => a.status === 'impediment');
    const nearEnd = activities
        .filter(a => {
            if (a.status === 'done' || a.status === 'impediment') return false;
            const d = daysUntil(a.endDate);
            return d <= NEAR_END_DAYS;
        })
        .sort((a, b) => daysUntil(a.endDate) - daysUntil(b.endDate));

    return (
        <section className={styles.section}>
            <header className={styles.header}>
                <h2 className={styles.title}>Distribuição por status</h2>
            </header>

            <div className={styles.body}>
                <div className={styles.chartSide}>
                    <SprintStatusChart counts={counts} total={total} />
                    <ul className={styles.legend}>
                        {SPRINT_STATUS_ORDER.map(status => {
                            const pct = total > 0 ? Math.round((counts[status] / total) * 100) : 0;
                            return (
                                <li key={status} className={styles.legendItem}>
                                    <span
                                        className={styles.legendDot}
                                        style={{ background: SPRINT_STATUS_COLOR[status] }}
                                    />
                                    <span className={styles.legendLabel}>{SPRINT_STATUS_LABEL[status]}</span>
                                    <span className={styles.legendCount}>
                                        {counts[status]} <span className={styles.legendPct}>({pct}%)</span>
                                    </span>
                                </li>
                            );
                        })}
                    </ul>
                </div>

                <div className={styles.listSide}>
                    <div className={styles.group}>
                        <h3 className={styles.groupTitle}>
                            <span
                                className={styles.groupDot}
                                style={{ background: SPRINT_STATUS_COLOR.impediment }}
                            />
                            Em impedimento
                            <span className={styles.groupCount}>{impediments.length}</span>
                        </h3>
                        {impediments.length === 0 ? (
                            <p className={styles.empty}>Nenhuma atividade em impedimento.</p>
                        ) : (
                            <ul className={styles.activityList}>
                                {impediments.map(a => (
                                    <li key={a.id} className={styles.activityItem}>
                                        <span
                                            className={styles.activityDot}
                                            style={{ background: SPRINT_STATUS_COLOR[a.status] }}
                                        />
                                        <span className={styles.activityName}>{a.name}</span>
                                        <span className={styles.activityDate}>{formatDate(a.endDate)}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <div className={styles.group}>
                        <h3 className={styles.groupTitle}>
                            <span
                                className={styles.groupDot}
                                style={{ background: 'var(--color-status-overdue)' }}
                            />
                            Próximas do prazo
                            <span className={styles.groupCount}>{nearEnd.length}</span>
                        </h3>
                        {nearEnd.length === 0 ? (
                            <p className={styles.empty}>Nenhuma atividade próxima do prazo.</p>
                        ) : (
                            <ul className={styles.activityList}>
                                {nearEnd.map(a => {
                                    const d = daysUntil(a.endDate);
                                    const hint =
                                        d < 0 ? `${Math.abs(d)}d atrasada`
                                        : d === 0 ? 'vence hoje'
                                        : `${d}d restantes`;
                                    return (
                                        <li key={a.id} className={styles.activityItem}>
                                            <span
                                                className={styles.activityDot}
                                                style={{ background: SPRINT_STATUS_COLOR[a.status] }}
                                            />
                                            <span className={styles.activityName}>{a.name}</span>
                                            <span className={`${styles.activityDate} ${d < 0 ? styles.overdue : ''}`}>
                                                {hint}
                                            </span>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
