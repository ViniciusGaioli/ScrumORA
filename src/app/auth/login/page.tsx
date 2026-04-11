import styles from "./Page.module.css"
import { LoginLogo } from "./_components/LoginLogo"

export default function login() {
    return (
        <div data-theme="light" className={styles.page}>
            <LoginLogo/>
        </div>
    )
}