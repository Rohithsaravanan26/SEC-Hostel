import { cn } from '@/lib/utils';
import { LeaveStatus } from '@/types';

interface StatusPillProps {
    status: LeaveStatus;
    className?: string;
}

const statusStyles: Record<LeaveStatus, string> = {
    Approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Pending: 'bg-amber-50 text-amber-700 border-amber-200',
    Rejected: 'bg-rose-50 text-rose-700 border-rose-200',
};

export function StatusPill({ status, className }: StatusPillProps) {
    return (
        <span
            className={cn(
                'inline-flexitems-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                statusStyles[status],
                className
            )}
        >
            {status}
        </span>
    );
}
