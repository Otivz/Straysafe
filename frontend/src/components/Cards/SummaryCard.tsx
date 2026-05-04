import React from 'react';

interface SummaryCardProps {
    label: string;
    value: string | number;
    subValue?: string;
    icon?: React.ReactNode;
    color?: string; // Hex color for the top border or value
    accentColor?: string; // Optional accent color for the value
    className?: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({
    label,
    value,
    subValue,
    icon,
    color = '#F97316',
    accentColor,
    className = ""
}) => {
    return (
        <div
            className={`bg-[#1B4340] border-t-2 p-5 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.4)] flex flex-col justify-center min-w-[150px] transition-all hover:scale-[1.02] active:scale-[0.98] ${className}`}
            style={{ borderTopColor: color }}
        >
            <div className="flex items-center justify-between mb-1.5">
                <span className="block text-[10px] font-black text-teal-100/60 uppercase tracking-[0.2em]">
                    {label}
                </span>
                {icon && <div className="text-teal-100/40">{icon}</div>}
            </div>

            <div className="flex items-baseline gap-2">
                <span
                    className="text-3xl font-black tracking-tight drop-shadow-sm"
                    style={{ color: accentColor || 'white' }}
                >
                    {value}
                </span>
                {subValue && (
                    <span className="text-[10px] font-bold text-teal-100/40 uppercase">
                        {subValue}
                    </span>
                )}
            </div>
        </div>
    );
};

export default SummaryCard;
