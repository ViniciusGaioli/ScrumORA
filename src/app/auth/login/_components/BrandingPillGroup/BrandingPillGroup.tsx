import styles from './BrandingPillGroup.module.css';
import { BrandingPill } from '../BrandingPill/BrandingPill';

interface BrandingPillGroupProps {
    pills: string[];
}

export function BrandingPillGroup({ pills }: BrandingPillGroupProps) {
    return (
        <div className={styles.group}>
        {pills.map(pill => (
            <BrandingPill key={pill} label={pill} />
        ))}
        </div>
    );
}