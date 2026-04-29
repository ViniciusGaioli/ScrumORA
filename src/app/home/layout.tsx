"use client";
import { useRouter } from "next/navigation";
import { Sidebar } from "../components/Sidebar/Sidebar";
import styles from "./HomeLayout.module.css";

export default function HomeLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();

    function handleLogout() {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('userName');
        router.replace('/auth/login');
    }

    return (
        <div className={styles.wrapper}>
            <Sidebar onLogout={handleLogout} />
            <main className={styles.main}>{children}</main>
        </div>
    );
}