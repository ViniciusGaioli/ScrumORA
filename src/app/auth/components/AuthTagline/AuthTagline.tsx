import styles from './AuthTagline.module.css';

interface AuthTaglineProps {
    title: string;
    highlight: string;
    subtitle: string;
}

export function AuthTagline({ title, highlight, subtitle }: AuthTaglineProps) {
    return (
        <div className={styles.wrapper}>
        <h1 className={styles.title}>
            {title} <span className={styles.highlight}>{highlight}</span>
        </h1>
        <p className={styles.subtitle}>{subtitle}</p>
        </div>
    );
}
