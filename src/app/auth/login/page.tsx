import styles from './Page.module.css';
import { LoginBranding } from '../components/LoginBranding/LoginBranding';
import { LoginForm } from './_components/LoginForm/LoginForm';
import { BrandingPillGroup } from './_components/BrandingPillGroup/BrandingPillGroup';

export default function LoginPage() {
    
const PILLS = [
    'Gestão de sprints',
    'Kanban de atividades',
    'Calendário de entregas',
    'Gráficos de progresso',
];
    return (
        <main className={styles.page}>
        <LoginBranding title="Gerencie sprints com clareza e" highlight="agilidade." subtitle="Organize atividades, acompanhe o progresso do time e entregue projetos no prazo." bottom={<BrandingPillGroup pills={PILLS} />}/>
        <div className={styles.formSide}>
            <div className={styles.formInner}>
                <LoginForm />
            </div>
        </div>
        </main>
    );
}