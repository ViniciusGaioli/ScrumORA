"use client";

import { useMemo, useState } from 'react';
import styles from './SprintProgress.module.css';
import { Activity } from '../../Kanban/ActivityCard/Activity';
import { ProjectTeam } from '../../Team/MemberCard/Member';
import { LineChart, LineSeries } from '../LineChart/LineChart';

const PALETTE = [
    'var(--color-avatar-1)',
    'var(--color-avatar-2)',
    'var(--color-avatar-3)',
    'var(--color-avatar-4)',
    'var(--color-avatar-5)',
    'var(--color-avatar-6)',
];

interface SprintProgressProps {
    activities: Activity[];
    teams: ProjectTeam[];
}

function diffInDays(from: string, to: string): number {
    const a = new Date(from);
    const b = new Date(to);
    a.setHours(0, 0, 0, 0);
    b.setHours(0, 0, 0, 0);
    return Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

function buildSprintSeries(activities: Activity[]): LineSeries[] {
    const sprintMap = new Map<number, { name: string; startDate: string; activities: Activity[] }>();
    for (const a of activities) {
        if (!a.sprint?.startDate) continue;
        const existing = sprintMap.get(a.sprint.id);
        if (existing) {
            existing.activities.push(a);
        } else {
            sprintMap.set(a.sprint.id, {
                name: a.sprint.name,
                startDate: a.sprint.startDate,
                activities: [a],
            });
        }
    }

    const series: LineSeries[] = [];
    let colorIdx = 0;
    for (const [id, data] of Array.from(sprintMap.entries()).sort((a, b) => a[0] - b[0])) {
        const doneItems = data.activities
            .filter(a => a.status === 'done')
            .map(a => diffInDays(data.startDate, a.endDate))
            .filter(d => d >= 0)
            .sort((a, b) => a - b);

        const lastDay = data.activities.reduce((max, a) => {
            const d = diffInDays(data.startDate, a.endDate);
            return d > max ? d : max;
        }, 0);

        const duration = Math.max(lastDay, 1);
        const points: number[] = [];
        let idx = 0;
        let cumulative = 0;
        for (let d = 0; d <= duration; d++) {
            while (idx < doneItems.length && doneItems[idx] <= d) {
                cumulative++;
                idx++;
            }
            points.push(cumulative);
        }

        series.push({
            id,
            label: `Sprint ${id} - ${data.name}`,
            color: PALETTE[colorIdx % PALETTE.length],
            points,
        });
        colorIdx++;
    }
    return series;
}

function buildTeamSeries(activities: Activity[], teams: ProjectTeam[]): LineSeries[] {
    const starts = activities.map(a => new Date(a.startDate).getTime());
    if (starts.length === 0) return [];
    const projectStart = new Date(Math.min(...starts)).toISOString();

    const series: LineSeries[] = [];
    let colorIdx = 0;
    for (const team of teams) {
        const teamActivities = activities.filter(a =>
            a.responsibles.some(r => r.team?.id === team.id)
        );
        const doneItems = teamActivities
            .filter(a => a.status === 'done')
            .map(a => diffInDays(projectStart, a.endDate))
            .filter(d => d >= 0)
            .sort((a, b) => a - b);

        const lastDay = activities.reduce((max, a) => {
            const d = diffInDays(projectStart, a.endDate);
            return d > max ? d : max;
        }, 0);

        const points: number[] = [];
        let idx = 0;
        let cumulative = 0;
        for (let d = 0; d <= lastDay; d++) {
            while (idx < doneItems.length && doneItems[idx] <= d) {
                cumulative++;
                idx++;
            }
            points.push(cumulative);
        }

        series.push({
            id: `team-${team.id}`,
            label: team.name,
            color: PALETTE[colorIdx % PALETTE.length],
            points,
        });
        colorIdx++;
    }
    return series;
}

type Mode = 'sprint' | 'team';

export function SprintProgress({ activities, teams }: SprintProgressProps) {
    const [mode, setMode] = useState<Mode>('sprint');

    const sprintSeries = useMemo(() => buildSprintSeries(activities), [activities]);
    const teamSeries = useMemo(() => buildTeamSeries(activities, teams), [activities, teams]);

    const currentSeries = mode === 'sprint' ? sprintSeries : teamSeries;
    const title = mode === 'sprint' ? 'Comparação entre sprints' : 'Velocidade por equipe';
    const yLabel = 'Atividades concluídas';
    const xLabel = mode === 'sprint' ? 'Dia da sprint' : 'Dia do projeto';

    return (
        <section className={styles.section}>
            <header className={styles.header}>
                <div>
                    <h2 className={styles.title}>Progresso das sprints</h2>
                    <p className={styles.subtitle}>
                        Atividades concluídas acumuladas ao longo do tempo.
                    </p>
                </div>
                <div className={styles.toggle} role="tablist">
                    <button
                        type="button"
                        role="tab"
                        aria-selected={mode === 'sprint'}
                        className={`${styles.toggleBtn} ${mode === 'sprint' ? styles.toggleBtnActive : ''}`}
                        onClick={() => setMode('sprint')}
                    >
                        Por sprint
                    </button>
                    <button
                        type="button"
                        role="tab"
                        aria-selected={mode === 'team'}
                        className={`${styles.toggleBtn} ${mode === 'team' ? styles.toggleBtnActive : ''}`}
                        onClick={() => setMode('team')}
                    >
                        Por equipe
                    </button>
                </div>
            </header>

            <div className={styles.chartWrap}>
                <h3 className={styles.chartTitle}>{title}</h3>
                {currentSeries.length === 0 ? (
                    <p className={styles.empty}>Sem dados para exibir.</p>
                ) : (
                    <LineChart series={currentSeries} xLabel={xLabel} yLabel={yLabel} />
                )}
            </div>
        </section>
    );
}
