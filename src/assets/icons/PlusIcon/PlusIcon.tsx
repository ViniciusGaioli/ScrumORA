interface PlusIconProps {
    size?: number;
    strokeWidth?: number;
}

export default function PlusIcon({ size = 16, strokeWidth = 2.5 }: PlusIconProps) {
    return (
        <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
    );
}
