import styles from "./BraindingPill.module.css"

interface BrandingPillProps {
    label: string;
}

export function BrandingPill({ label }: BrandingPillProps) {
    return (
        <div className={styles.pill}>
        <span className={styles.dot} />
        {label}
        </div>
    );
}