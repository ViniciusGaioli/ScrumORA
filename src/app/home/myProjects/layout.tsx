"use client";
import { Sidebar } from "../components/Sidebar/Sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
    return (
        <div style={{ display: 'flex' }}>
            <Sidebar />
            <main>{children}</main>
        </div>
    );
}