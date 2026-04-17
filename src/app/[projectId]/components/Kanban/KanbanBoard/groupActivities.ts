import { Activity } from '../ActivityCard/Activity';
import { KanbanGroupData } from '../KanbanGroup/KanbanGroup';

type GroupBy = 'team' | 'sprint';

export function groupActivities(
    activities: Activity[],
    groupBy: GroupBy
): KanbanGroupData[] {
    const map = new Map<string, KanbanGroupData>();

    if (groupBy === 'team') {
        for (const activity of activities) {
            const teams = activity.responsibles
                .filter(r => r.team)
                .map(r => r.team!);

            if (teams.length === 0) {
                if (!map.has('none')) {
                    map.set('none', { id: 'none', label: 'Sem equipe', activities: [] });
                }
                map.get('none')!.activities.push(activity);
                continue;
            }

            for (const team of teams) {
                const key = String(team.id);
                if (!map.has(key)) {
                    map.set(key, { id: key, label: team.name, activities: [] });
                }
                map.get(key)!.activities.push(activity);
            }
        }
    }

    if (groupBy === 'sprint') {
        for (const activity of activities) {
            if (!activity.sprint) {
                if (!map.has('none')) {
                    map.set('none', { id: 'none', label: 'Sem sprint', activities: [] });
                }
                map.get('none')!.activities.push(activity);
                continue;
            }

            const key = String(activity.sprint.id);
            if (!map.has(key)) {
                map.set(key, { id: key, label: `Sprint ${activity.sprint.id} - ${activity.sprint.name}`, activities: [] });
            }
            map.get(key)!.activities.push(activity);
        }
    }

    return sortGroups(Array.from(map.values()));
}

function sortGroups(groups: KanbanGroupData[]): KanbanGroupData[] {
    return groups.sort((a, b) => {
        if (a.id === 'none') return 1;
        if (b.id === 'none') return -1;
        return a.label.localeCompare(b.label);
    });
}
