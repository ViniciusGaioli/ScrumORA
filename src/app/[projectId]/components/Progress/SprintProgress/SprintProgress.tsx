"use client";

import { useMemo, useState } from 'react';
import styles from './SprintProgress.module.css';
import { Activity, ActivityStatus } from '../../Kanban/ActivityCard/Activity';
import { ApiSprintInfo } from '../../../services/activityService';
import { SPRINT_STATUS_ORDER, SPRINT_STATUS_COLOR, SPRINT_STATUS_LABEL } from '../../Sprints/SprintStatusChart/SprintStatusChart';

interface SprintProgressProps {
    activities: Activity[];
    sprints: ApiSprintInfo[];
}

interface BarDay {
    date: string;
    total: number;
    segments: { status: ActivityStatus; count: number }[];
}

const CHART_W = 640;
const CHART_H = 260;
const PAD = { top: 16, right: 20, bottom: 48, left: 36 };

function toDateKey(iso: string): string {
    return iso.slice(0, 10);
}

function addDays(dateStr: string, n: number): string {
    const d = new Date(dateStr);
    d.setDate(d.getDate() + n);
    return toDateKey(d.toISOString());
}

function diffDays(from: string, to: string): number {
    const a = new Date(from);
    const b = new Date(to);
    a.setHours(0, 0, 0, 0);
    b.setHours(0, 0, 0, 0);
    return Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

function formatDateLabel(dateStr: string): string {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

function buildBars(sprint: ApiSprintInfo, activities: Activity[]): BarDay[] {
    const start = toDateKey(sprint.dataInicio);
    const end = toDateKey(sprint.dataFim);
    const duration = diffDays(start, end);

    const byDate: Record<string, Record<ActivityStatus, number>> = {};
    for (let i = 0; i <= duration; i++) {
        const key = addDays(start, i);
        byDate[key] = { backlog: 0, development: 0, impediment: 0, approval: 0, done: 0 };
    }

    for (const a of activities) {
        const key = toDateKey(a.endDate);
        if (key in byDate) {
            byDate[key][a.status]++;
        }
    }

    return Object.entries(byDate).map(([date, counts]) => {
        const segments = SPRINT_STATUS_ORDER
            .filter(s => counts[s] > 0)
            .map(s => ({ status: s, count: counts[s] }));
        const total = segments.reduce((sum, s) => sum + s.count, 0);
        return { date, total, segments };
    });
}

export function SprintProgress({ activities, sprints }: SprintProgressProps) {
    const [selectedSprintId, setSelectedSprintId] = useState<number | null>(null);

    const sprintId = selectedSprintId ?? sprints[0]?.id ?? null;
    const sprint = sprints.find(s => s.id === sprintId) ?? null;

    const sprintActivities = useMemo(
        () => activities.filter(a => a.sprint?.id === sprintId),
        [activities, sprintId],
    );

    const bars = useMemo(
        () => (sprint ? buildBars(sprint, sprintActivities) : []),
        [sprint, sprintActivities],
    );

    const maxY = Math.max(1, ...bars.map(b => b.total));
    const innerW = CHART_W - PAD.left - PAD.right;
    const innerH = CHART_H - PAD.top - PAD.bottom;

    const barCount = bars.length;
    const barW = Math.max((innerW / Math.max(barCount, 1)) * 0.55, 2);

    const xAt = (i: number) => PAD.left + (i + 0.5) * (innerW / Math.max(barCount, 1));
    const yAt = (v: number) => PAD.top + innerH - (v / maxY) * innerH;

    const yTicks = Math.min(maxY, 5);
    const yTickValues = Array.from({ length: yTicks + 1 }, (_, i) =>
        Math.round((maxY * i) / yTicks),
    );

    const xLabelStep = barCount <= 10 ? 1 : barCount <= 20 ? 2 : Math.ceil(barCount / 10);

    const legendStatuses = SPRINT_STATUS_ORDER.filter(s =>
        bars.some(b => b.segments.some(seg => seg.status === s)),
    );

    return (
        <section className={styles.section}>
            <header className={styles.header}>
                <div>
                    <h2 className={styles.title}>Progresso das sprints</h2>
                    <p className={styles.subtitle}>Atividades por prazo dentro da sprint.</p>
                </div>
                {sprints.length > 0 && (
                    <select
                        className={styles.sprintSelect}
                        value={sprintId ?? ''}
                        onChange={e => setSelectedSprintId(Number(e.target.value))}
                    >
                        {sprints.map(s => (
                            <option key={s.id} value={s.id}>{s.nome}</option>
                        ))}
                    </select>
                )}
            </header>

            {!sprint || bars.length === 0 ? (
                <p className={styles.empty}>Sem dados para exibir.</p>
            ) : (
                <>
                    <svg
                        viewBox={`0 0 ${CHART_W} ${CHART_H}`}
                        className={styles.svg}
                        role="img"
                        aria-label="Gráfico de atividades por prazo"
                    >
                        {yTickValues.map((t, i) => (
                            <g key={`y-${i}`}>
                                <line
                                    x1={PAD.left} y1={yAt(t)}
                                    x2={CHART_W - PAD.right} y2={yAt(t)}
                                    stroke="var(--color-border)"
                                    strokeWidth={1}
                                    strokeDasharray="2 3"
                                />
                                <text
                                    x={PAD.left - 6}
                                    y={yAt(t)}
                                    textAnchor="end"
                                    dominantBaseline="central"
                                    className={styles.axisText}
                                >
                                    {t}
                                </text>
                            </g>
                        ))}

                        <line
                            x1={PAD.left} y1={PAD.top + innerH}
                            x2={CHART_W - PAD.right} y2={PAD.top + innerH}
                            stroke="var(--color-border-hover)" strokeWidth={1}
                        />
                        <line
                            x1={PAD.left} y1={PAD.top}
                            x2={PAD.left} y2={PAD.top + innerH}
                            stroke="var(--color-border-hover)" strokeWidth={1}
                        />

                        {bars.map((b, i) => {
                            const x = xAt(i);
                            let stackY = PAD.top + innerH;
                            return (
                                <g key={b.date}>
                                    {b.segments.map(seg => {
                                        const segH = (seg.count / maxY) * innerH;
                                        stackY -= segH;
                                        return (
                                            <rect
                                                key={seg.status}
                                                x={x - barW / 2}
                                                y={stackY}
                                                width={barW}
                                                height={segH}
                                                fill={SPRINT_STATUS_COLOR[seg.status]}
                                                rx={seg === b.segments[b.segments.length - 1] ? 2 : 0}
                                            />
                                        );
                                    })}
                                    {b.total > 0 && (
                                        <text
                                            x={x}
                                            y={yAt(b.total) - 4}
                                            textAnchor="middle"
                                            className={styles.barLabel}
                                            fill={SPRINT_STATUS_COLOR[b.segments[b.segments.length - 1].status]}
                                        >
                                            {b.total}
                                        </text>
                                    )}
                                    {i % xLabelStep === 0 && (
                                        <text
                                            x={x}
                                            y={PAD.top + innerH + 14}
                                            textAnchor="middle"
                                            className={styles.axisText}
                                        >
                                            {formatDateLabel(b.date)}
                                        </text>
                                    )}
                                </g>
                            );
                        })}

                        <text
                            x={CHART_W - PAD.right}
                            y={PAD.top + innerH + 36}
                            textAnchor="end"
                            className={styles.axisLabel}
                        >
                            Prazo
                        </text>
                        <text
                            x={-(PAD.top + innerH / 2)}
                            y={12}
                            textAnchor="middle"
                            transform="rotate(-90)"
                            className={styles.axisLabel}
                        >
                            Atividades
                        </text>
                    </svg>

                    {legendStatuses.length > 0 && (
                        <ul className={styles.legend}>
                            {legendStatuses.map(s => (
                                <li key={s} className={styles.legendItem}>
                                    <span
                                        className={styles.legendDot}
                                        style={{ background: SPRINT_STATUS_COLOR[s] }}
                                    />
                                    {SPRINT_STATUS_LABEL[s]}
                                </li>
                            ))}
                        </ul>
                    )}
                </>
            )}
        </section>
    );
}
