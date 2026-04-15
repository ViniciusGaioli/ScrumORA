import styles from './SectionIntro.module.css';

interface PageHeaderProps {
    greeting?: string;
    title: string;
    highlight?: string;
}

export function SectionIntro({ greeting, title, highlight }: PageHeaderProps) {
    return (
        <div className={styles.wrapper}>
            {greeting && <p className={styles.greeting}>{greeting}</p>}
            <h1 className={styles.title}>
                {title} {highlight && <span className={styles.highlight}>{highlight}</span>}
            </h1>
        </div>
    );
}
