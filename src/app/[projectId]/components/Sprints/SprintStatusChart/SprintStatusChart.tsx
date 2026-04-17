import styles from './SprintStatusChart.module.css';
import { ActivityStatus } from '../../Kanban/ActivityCard/Activity';

export const SPRINT_STATUS_ORDER: ActivityStatus[] = [
    'backlog',
    'development',
    'impediment',
    'approval',
    'done',
];

export const SPRINT_STATUS_LABEL: Record<ActivityStatus, string> = {
    backlog:     'Backlog',
    development: 'Desenvolvimento',
    impediment:  'Impedimento',
    approval:    'Aprovação',
    done:        'Finalizada',
};

export const SPRINT_STATUS_COLOR: Record<ActivityStatus, string> = {
    backlog:     'var(--color-status-backlog)',
    development: 'var(--color-status-development)',
    impediment:  'var(--color-status-impediment)',
    approval:    'var(--color-status-approval)',
    done:        'var(--color-status-done)',
};

interface SprintStatusChartProps {
    counts: Record<ActivityStatus, number>;
    total: number;
}

const SIZE = 160;
const STROKE = 22;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function SprintStatusChart({ counts, total }: SprintStatusChartProps) {
    if (total === 0) {
        return (
            <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} className={styles.chart}>
                <circle
                    cx={SIZE / 2}
                    cy={SIZE / 2}
                    r={RADIUS}
                    fill="none"
                    stroke="var(--color-border)"
                    strokeWidth={STROKE}
                />
            </svg>
        );
    }

    let cumulative = 0;

    return (
        <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} className={styles.chart}>
            <circle
                cx={SIZE / 2}
                cy={SIZE / 2}
                r={RADIUS}
                fill="none"
                stroke="var(--color-border)"
                strokeWidth={STROKE}
            />
            {SPRINT_STATUS_ORDER.map(status => {
                const value = counts[status];
                if (value === 0) return null;
                const fraction = value / total;
                const length = fraction * CIRCUMFERENCE;
                const offset = -cumulative * CIRCUMFERENCE;
                cumulative += fraction;
                return (
                    <circle
                        key={status}
                        cx={SIZE / 2}
                        cy={SIZE / 2}
                        r={RADIUS}
                        fill="none"
                        stroke={SPRINT_STATUS_COLOR[status]}
                        strokeWidth={STROKE}
                        strokeDasharray={`${length} ${CIRCUMFERENCE - length}`}
                        strokeDashoffset={offset}
                    />
                );
            })}
            <text
                x={SIZE / 2}
                y={SIZE / 2}
                textAnchor="middle"
                dominantBaseline="central"
                className={styles.total}
            >
                {total}
            </text>
        </svg>
    );
}
