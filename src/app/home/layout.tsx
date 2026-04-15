"use client";
import { Sidebar } from "../components/Sidebar/Sidebar";
import styles from "./HomeLayout.module.css";

export default function HomeLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className={styles.wrapper}>
            <Sidebar />
            <main className={styles.main}>{children}</main>
        </div>
    );
}