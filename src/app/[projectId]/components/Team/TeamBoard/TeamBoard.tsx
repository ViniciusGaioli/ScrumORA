import styles from './TeamBoard.module.css';
import { TeamGroup, TeamGroupData } from '../TeamGroup/TeamGroup';

interface TeamBoardProps {
    groups: TeamGroupData[];
}

export function TeamBoard({ groups }: TeamBoardProps) {
    if (groups.length === 0) {
        return (
            <div className={styles.empty}>
                <p className={styles.emptyText}>Nenhum integrante encontrado.</p>
            </div>
        );
    }

    return (
        <div className={styles.board}>
            {groups.map(group => (
                <TeamGroup key={group.id} group={group} />
            ))}
        </div>
    );
}
