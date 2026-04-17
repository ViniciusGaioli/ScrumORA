import styles from './TeamBoard.module.css';
import { TeamGroup, TeamGroupData } from '../TeamGroup/TeamGroup';
import { Member } from '../MemberCard/Member';

interface TeamBoardProps {
    groups: TeamGroupData[];
    canEdit?: boolean;
    onMemberMenuClick?: (member: Member) => void;
}

export function TeamBoard({ groups, canEdit = false, onMemberMenuClick }: TeamBoardProps) {
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
                <TeamGroup
                    key={group.id}
                    group={group}
                    canEdit={canEdit}
                    onMemberMenuClick={onMemberMenuClick}
                />
            ))}
        </div>
    );
}
