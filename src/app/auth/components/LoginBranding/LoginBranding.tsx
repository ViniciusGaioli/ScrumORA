import styles from './LoginBranding.module.css';
import { AuthLogo } from '../AuthLogo/AuthLogo';
import { AuthTagline } from '../AuthTagline/AuthTagline';

interface LoginBrandingProps {
    title: string;
    highlight: string;
    subtitle: string;
    bottom: React.ReactNode;
}

export function LoginBranding({ title, highlight, subtitle, bottom }: LoginBrandingProps) {
    return (
        <aside className={styles.wrapper}>
        <div className={styles.pattern} />
        <AuthLogo />
        <AuthTagline title={title} highlight={highlight} subtitle={subtitle} />
        <div>{bottom}</div>
        </aside>
    );
}
