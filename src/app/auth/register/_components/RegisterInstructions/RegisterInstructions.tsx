import styles from './RegisterInstructions.module.css';
import { InstructionStep } from '../../../components/InstructionStep/InstructionStep';

const STEPS = [
    {
        number: 1,
        title: 'Crie sua conta',
        subtitle: 'Preencha seus dados e confirme o e-mail',
    },
    {
        number: 2,
        title: 'Crie ou entre em um projeto',
        subtitle: 'Você será Scrum Master automaticamente',
    },
    {
        number: 3,
        title: 'Convide seu time',
        subtitle: 'Adicione integrantes por e-mail',
    },
];

export function RegisterInstructions() {
    return (
        <div className={styles.group}>
        {STEPS.map(step => (
            <InstructionStep key={step.number} number={step.number} title={step.title} subtitle={step.subtitle}/>
        ))}
        </div>
    );
}