import { Geist, Plus_Jakarta_Sans } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
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
        <html lang="pt-BR" className={`${geist.variable} ${plusJakarta.variable}`} suppressHydrationWarning>
            <body suppressHydrationWarning>
                <ThemeProvider attribute="data-theme" defaultTheme="system" enableSystem>
                    {children}
                </ThemeProvider>
            </body>
        </html>
    );
}
