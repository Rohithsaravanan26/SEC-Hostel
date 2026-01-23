import React from 'react';
import { cn } from '@/lib/utils';

interface Column<T> {
    header: string;
    accessorKey?: keyof T;
    cell?: (item: T) => React.ReactNode;
    className?: string;
}

interface ResponsiveTableProps<T> {
    data: T[];
    columns: Column<T>[];
    keyExtractor: (item: T) => string | number;
    onRowClick?: (item: T) => void;
    /** Custom render for mobile card. If not provided, it tries to render columns. */
    mobileCardRender?: (item: T) => React.ReactNode;
    selectedIds?: (string | number)[];
    onSelectRow?: (id: string | number) => void;
    onSelectAll?: (ids: (string | number)[]) => void;
}

export function ResponsiveTable<T>({
    data,
    columns,
    keyExtractor,
    onRowClick,
    mobileCardRender,
    selectedIds = [],
    onSelectRow,
    onSelectAll,
}: ResponsiveTableProps<T>) {
    const allSelected = data.length > 0 && data.every(item => selectedIds.includes(keyExtractor(item)));
    const handleSelectAll = () => {
        if (!onSelectAll) return;
        if (allSelected) {
            onSelectAll([]);
        } else {
            onSelectAll(data.map(item => keyExtractor(item)));
        }
    };
    return (
        <div className="w-full">
            {/* Mobile View: Card Stack */}
            <div className="block sm:hidden space-y-4">
                {data.map((item) => (
                    <div
                        key={keyExtractor(item)}
                        className="bg-white p-4 rounded-lg shadow-sm border border-slate-100 space-y-3 cursor-pointer"
                        onClick={() => onRowClick?.(item)}
                    >
                        {mobileCardRender ? (
                            mobileCardRender(item)
                        ) : (
                            // Default fallback card (just renders columns stack)
                            <div className="space-y-2">
                                {columns.map((col, idx) => (
                                    <div key={idx} className="flex justify-between">
                                        <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                                            {col.header}
                                        </span>
                                        <span className="text-sm font-medium text-slate-900">
                                            {col.cell
                                                ? col.cell(item)
                                                : col.accessorKey
                                                    ? (item[col.accessorKey] as React.ReactNode)
                                                    : null}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
                {data.length === 0 && (
                    <div className="text-center py-8 text-slate-500 text-sm">No records found.</div>
                )}
            </div>

            {/* Desktop View: Table */}
            <div className="hidden sm:block overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                        <tr>
                            {columns.map((col, idx) => (
                                <th
                                    key={idx}
                                    scope="col"
                                    className={cn(
                                        "px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider",
                                        col.className
                                    )}
                                >
                                    {col.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                        {data.map((item) => (
                            <tr
                                key={keyExtractor(item)}
                                onClick={() => onRowClick?.(item)}
                                className={cn(
                                    "hover:bg-slate-50 transition-colors duration-150 ease-in-out",
                                    onRowClick && "cursor-pointer",
                                    selectedIds.includes(keyExtractor(item)) && "bg-indigo-50/50"
                                )}
                            >
                                {onSelectRow && (
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <input
                                            type="checkbox"
                                            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                                            checked={selectedIds.includes(keyExtractor(item))}
                                            onChange={() => onSelectRow(keyExtractor(item))}
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                    </td>
                                )}
                                {columns.map((col, idx) => (
                                    <td
                                        key={idx}
                                        className={cn(
                                            "px-6 py-4 whitespace-nowrap text-sm text-slate-900",
                                            col.className
                                        )}
                                    >
                                        {col.cell
                                            ? col.cell(item)
                                            : col.accessorKey
                                                ? (item[col.accessorKey] as React.ReactNode)
                                                : null}
                                    </td>
                                ))}
                            </tr>
                        ))}
                        {data.length === 0 && (
                            <tr>
                                <td colSpan={columns.length + (onSelectRow ? 1 : 0)} className="px-6 py-8 text-center text-sm text-slate-500">
                                    No records found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
