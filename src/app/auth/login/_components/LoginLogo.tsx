import styles from "./LoginLogo.module.css"

export function LoginLogo() {
    return (
        <div className={styles.wrapper}>
        <div className={styles.mark}>SO</div>
        <span className={styles.name}>ScrumORA</span>
        </div>
    );
}