import styles from './TeamGroup.module.css';
import { Member } from '../MemberCard/Member';
import { MemberCard } from '../MemberCard/MemberCard';

export interface TeamGroupData {
    id: string;
    label: string;
    members: Member[];
    isUnassigned?: boolean;
}

interface TeamGroupProps {
    group: TeamGroupData;
}

export function TeamGroup({ group }: TeamGroupProps) {
    return (
        <div className={styles.group}>
            <div className={styles.header}>
                <span className={`${styles.label} ${group.isUnassigned ? styles.labelMuted : ''}`}>
                    {group.label}
                </span>
                <span className={styles.count}>{group.members.length}</span>
                <div className={styles.divider} />
            </div>

            {group.members.length === 0 ? (
                <p className={styles.empty}>Nenhum integrante nesta equipe.</p>
            ) : (
                <div className={styles.grid}>
                    {group.members.map(member => (
                        <MemberCard key={member.id} member={member} />
                    ))}
                </div>
            )}
        </div>
    );
}
