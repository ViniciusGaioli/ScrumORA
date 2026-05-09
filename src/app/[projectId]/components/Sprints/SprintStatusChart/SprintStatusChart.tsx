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
    size?: number;
}

export function SprintStatusChart({ counts, total, size = 160 }: SprintStatusChartProps) {
    const stroke = size * 0.1375;
    const radius = (size - stroke) / 2;
    const circumference = 2 * Math.PI * radius;
    const fontSize = size * 0.28;

    if (total === 0) {
        return (
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className={styles.chart}>
                <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--color-border)" strokeWidth={stroke} />
            </svg>
        );
    }

    let cumulative = 0;

    return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className={styles.chart}>
            <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--color-border)" strokeWidth={stroke} />
            {SPRINT_STATUS_ORDER.map(status => {
                const value = counts[status];
                if (value === 0) return null;
                const fraction = value / total;
                const length = fraction * circumference;
                const offset = -cumulative * circumference;
                cumulative += fraction;
                return (
                    <circle
                        key={status}
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        stroke={SPRINT_STATUS_COLOR[status]}
                        strokeWidth={stroke}
                        strokeDasharray={`${length} ${circumference - length}`}
                        strokeDashoffset={offset}
                    />
                );
            })}
            <text
                x={size / 2}
                y={size / 2}
                textAnchor="middle"
                dominantBaseline="central"
                className={styles.total}
                style={{ fontSize }}
            >
                {total}
            </text>
        </svg>
    );
}
