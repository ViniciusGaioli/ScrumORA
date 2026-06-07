"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import styles from './page.module.css';
import { GeneralVision } from '../components/Progress/GeneralVision/GeneralVision';
import { StatusDistribution } from '../components/Progress/StatusDistribution/StatusDistribution';
import { SprintProgress } from '../components/Progress/SprintProgress/SprintProgress';
import { fetchActivities, fetchSprints, ApiSprintInfo } from '../services/activityService';
import { Activity } from '../components/Kanban/ActivityCard/Activity';

export default function ProgressPage() {
    const { projectId } = useParams<{ projectId: string }>();
    const [activities, setActivities] = useState<Activity[]>([]);
    const [sprints, setSprints] = useState<ApiSprintInfo[]>([]);

    useEffect(() => {
        const token = localStorage.getItem('accessToken') ?? '';
        Promise.all([
            fetchActivities(projectId, token),
            fetchSprints(projectId, token),
        ]).then(([acts, sprintList]) => {
            setActivities(acts);
            setSprints(sprintList);
        });
    }, [projectId]);

    return (
        <div className={styles.page}>
            <main className={styles.main}>
                <div className={styles.list}>
                    <GeneralVision activities={activities} />
                    <StatusDistribution activities={activities} />
                    <SprintProgress activities={activities} sprints={sprints} />
                </div>
            </main>
        </div>
    );
}
