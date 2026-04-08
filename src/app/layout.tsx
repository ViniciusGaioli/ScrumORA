import { Geist, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

const geist = Geist({
    subsets: ['latin'],
    variable: '--font-body',
});

const plusJakarta = Plus_Jakarta_Sans({
    subsets: ['latin'],
    variable: '--font-title',
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="pt-BR" className={`${geist.variable} ${plusJakarta.variable}`}>
            <body>{children}</body>
        </html>
    );
}
