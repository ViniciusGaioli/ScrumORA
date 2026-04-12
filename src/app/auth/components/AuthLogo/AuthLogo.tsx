import styles from './AuthLogo.module.css';

export function AuthLogo() {
    return (
        <div className={styles.wrapper}>
        <div className={styles.mark}>SO</div>
        <span className={styles.name}>ScrumORA</span>
        </div>
    );
}
