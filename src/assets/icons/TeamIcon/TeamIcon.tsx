interface TeamIconProps {
    size?: number;
}

export default function TeamIcon({ size = 14 }: TeamIconProps) {
    return (
        <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
            <rect x="3" y="7" width="13" height="13" rx="2"/>
            <path d="M8 7V5a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v12"/>
        </svg>
    );
}
