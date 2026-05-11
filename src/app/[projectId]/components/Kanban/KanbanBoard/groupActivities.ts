import { Activity } from '../ActivityCard/Activity';
import { KanbanGroupData } from '../KanbanGroup/KanbanGroup';
import { ProjectTeam } from '../../Team/MemberCard/Member';
import { ApiSprintInfo } from '../../../services/activityService';

type GroupBy = 'team' | 'sprint';

export function groupActivities(
    activities: Activity[],
    groupBy: GroupBy,
    allTeams: ProjectTeam[] = [],
    allSprints: ApiSprintInfo[] = [],
): KanbanGroupData[] {
    const map = new Map<string, KanbanGroupData>();

    if (groupBy === 'team') {
        map.set('none', { id: 'none', label: 'Sem equipe', activities: [] });
        for (const team of allTeams) {
            map.set(String(team.id), { id: String(team.id), label: team.name, activities: [] });
        }
        for (const activity of activities) {
            const teams = activity.responsibles
                .filter(r => r.team)
                .map(r => r.team!);

            if (teams.length === 0) {
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
        map.set('none', { id: 'none', label: 'Sem sprint', activities: [] });
        for (const sprint of allSprints) {
            map.set(String(sprint.id), {
                id: String(sprint.id),
                label: `Sprint ${sprint.id} - ${sprint.nome}`,
                activities: [],
            });
        }
        for (const activity of activities) {
            if (!activity.sprint) {
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
        if (a.id === 'none') return -1;
        if (b.id === 'none') return 1;
        return a.label.localeCompare(b.label);
    });
}
