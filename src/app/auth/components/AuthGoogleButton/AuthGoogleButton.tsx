"use client";
import styles from './AuthGoogleButton.module.css';
import GoogleIcon from '@/src/assets/icons/GoogleIcon/GoogleIcon';

interface AuthGoogleButtonProps {
    onClick?: () => void;
    text: string;
}

export function AuthGoogleButton({ onClick, text }: AuthGoogleButtonProps) {
    return (
        <button className={styles.btn} onClick={onClick}>
        <GoogleIcon/>
        {text}
        </button>
    );
}
