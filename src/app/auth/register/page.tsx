import styles from './Page.module.css';
import { LoginBranding } from '../components/LoginBranding/LoginBranding';
import { RegisterForm } from './_components/RegisterForm/RegisterForm';
import { BrandingPillGroup } from '../login/_components/BrandingPillGroup/BrandingPillGroup';
import { RegisterInstructions } from './_components/RegisterInstructions/RegisterInstructions';

const PILLS = [
    'Gestão de sprints',
    'Kanban de atividades',
    'Calendário de entregas',
    'Gráficos de progresso',
];

export default function RegisterPage() {
    return (
        <main className={styles.page}>
        <LoginBranding
            title="Comece a organizar seu time com"
            highlight="agilidade."
            subtitle="Crie sua conta gratuitamente e convide seu time em menos de 2 minutos."
            bottom={<RegisterInstructions />}
        />
        <div className={styles.formSide}>
            <div className={styles.formInner}>
                <RegisterForm />
            </div>
        </div>
        </main>
    );
}
