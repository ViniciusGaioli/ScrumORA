import styles from './LineChart.module.css';

export interface LineSeries {
    id: string | number;
    label: string;
    color: string;
    points: number[];
}

interface LineChartProps {
    series: LineSeries[];
    xLabel?: string;
    yLabel?: string;
}

const WIDTH = 640;
const HEIGHT = 280;
const PADDING = { top: 16, right: 16, bottom: 36, left: 36 };

export function LineChart({ series, xLabel, yLabel }: LineChartProps) {
    const maxX = Math.max(
        1,
        ...series.map(s => s.points.length - 1),
    );
    const maxY = Math.max(
        1,
        ...series.flatMap(s => s.points),
    );

    const innerW = WIDTH - PADDING.left - PADDING.right;
    const innerH = HEIGHT - PADDING.top - PADDING.bottom;

    const xAt = (i: number) => PADDING.left + (i / maxX) * innerW;
    const yAt = (v: number) => PADDING.top + innerH - (v / maxY) * innerH;

    const yTicks = 4;
    const ticks = Array.from({ length: yTicks + 1 }, (_, i) => Math.round((maxY * i) / yTicks));

    return (
        <div className={styles.wrap}>
            <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className={styles.svg} role="img">
                {ticks.map((t, i) => (
                    <g key={`tick-${i}`}>
                        <line
                            x1={PADDING.left}
                            y1={yAt(t)}
                            x2={WIDTH - PADDING.right}
                            y2={yAt(t)}
                            className={styles.gridLine}
                        />
                        <text
                            x={PADDING.left - 6}
                            y={yAt(t)}
                            textAnchor="end"
                            dominantBaseline="central"
                            className={styles.axisText}
                        >
                            {t}
                        </text>
                    </g>
                ))}

                <line
                    x1={PADDING.left}
                    y1={HEIGHT - PADDING.bottom}
                    x2={WIDTH - PADDING.right}
                    y2={HEIGHT - PADDING.bottom}
                    className={styles.axis}
                />
                <line
                    x1={PADDING.left}
                    y1={PADDING.top}
                    x2={PADDING.left}
                    y2={HEIGHT - PADDING.bottom}
                    className={styles.axis}
                />

                {[0, Math.floor(maxX / 2), maxX].map((i, idx) => (
                    <text
                        key={`xlabel-${idx}`}
                        x={xAt(i)}
                        y={HEIGHT - PADDING.bottom + 16}
                        textAnchor="middle"
                        className={styles.axisText}
                    >
                        D{i + 1}
                    </text>
                ))}

                {series.map(s => {
                    if (s.points.length === 0) return null;
                    const d = s.points
                        .map((v, i) => `${i === 0 ? 'M' : 'L'} ${xAt(i)} ${yAt(v)}`)
                        .join(' ');
                    return (
                        <g key={s.id}>
                            <path d={d} fill="none" stroke={s.color} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
                            {s.points.map((v, i) => (
                                <circle
                                    key={i}
                                    cx={xAt(i)}
                                    cy={yAt(v)}
                                    r={2.5}
                                    fill={s.color}
                                />
                            ))}
                        </g>
                    );
                })}

                {xLabel && (
                    <text
                        x={PADDING.left + innerW / 2}
                        y={HEIGHT - 4}
                        textAnchor="middle"
                        className={styles.axisLabel}
                    >
                        {xLabel}
                    </text>
                )}
                {yLabel && (
                    <text
                        x={-PADDING.top - innerH / 2}
                        y={12}
                        textAnchor="middle"
                        transform="rotate(-90)"
                        className={styles.axisLabel}
                    >
                        {yLabel}
                    </text>
                )}
            </svg>

            {series.length > 0 && (
                <ul className={styles.legend}>
                    {series.map(s => (
                        <li key={s.id} className={styles.legendItem}>
                            <span className={styles.legendDot} style={{ background: s.color }} />
                            <span>{s.label}</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
