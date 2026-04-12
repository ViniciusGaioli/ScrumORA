import styles from './InstructionStep.module.css';

interface InstructionProps {
    number: number;
    title: string;
    subtitle: string;
}

export function InstructionStep({ number, title, subtitle }: InstructionProps) {
    return (
        <div className={styles.step}>
        <div className={styles.number}>{number}</div>
        <div className={styles.body}>
            <p className={styles.title}>{title}</p>
            <p className={styles.subtitle}>{subtitle}</p>
        </div>
        </div>
    );
}