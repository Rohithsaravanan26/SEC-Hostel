'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { ResponsiveTable } from '@/components/ui/ResponsiveTable';
import { StatusPill } from '@/components/ui/StatusPill';
import { CheckCircle, XCircle, LogOut, ShieldCheck, Search, Filter } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { LeaveRequest, User } from '@/types';
import { cn } from '@/lib/utils';

export default function WardenPage() {
    const [requests, setRequests] = useState<(LeaveRequest & { users: User })[]>([]);
    const [selectedIds, setSelectedIds] = useState<(string | number)[]>([]); // ResponsiveTable uses string|number
    const [filterStatus, setFilterStatus] = useState<'All' | 'Pending' | 'Approved'>('Pending'); // Default to Pending for efficiency
    const [searchQuery, setSearchQuery] = useState('');
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        const { data: session } = await supabase.auth.getSession();
        if (!session.session) {
            router.push('/login');
            return;
        }

        const { data, error } = await supabase
            .from('leave_requests')
            .select('*, users!leave_requests_student_id_fkey(*), assigned_warden:users!leave_requests_assigned_warden_id_fkey(id, full_name, hostel_block)')
            .order('created_at', { ascending: false });

        if (error) {
            console.error(error);
        } else {
            setRequests(data as any);
        }
    };

    const handleStatusUpdate = async (id: number, status: 'Approved' | 'Rejected') => {
        await supabase.from('leave_requests').update({ status }).eq('id', id);
        fetchRequests(); // Refresh
    };

    const handleBulkApprove = async () => {
        if (selectedIds.length === 0) return;
        const { error } = await supabase
            .from('leave_requests')
            .update({ status: 'Approved' })
            .in('id', selectedIds);

        if (!error) {
            setSelectedIds([]);
            fetchRequests();
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/login');
    };

    const filteredRequests = requests.filter(req => {
        const matchesStatus = filterStatus === 'All' || req.status === filterStatus;
        const matchesSearch = req.users?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            req.users?.register_number?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    const columns = [
        {
            header: 'Student',
            cell: (item: any) => (
                <div>
                    <div className="font-medium text-slate-900">{item.users?.full_name || 'Unknown'}</div>
                    <div className="text-xs text-slate-500">{item.users?.register_number}</div>
                </div>
            )
        },
        { header: 'Type', accessorKey: 'type' as const },
        {
            header: 'Out Date',
            cell: (item: LeaveRequest) => format(new Date(item.out_date), 'MMM d, h:mm a')
        },
        { header: 'Reason', accessorKey: 'reason' as const, className: 'max-w-xs truncate' },
        {
            header: 'Assigned Warden',
            cell: (item: any) => (
                <div className="text-sm">
                    {item.assigned_warden ? (
                        <div>
                            <div className="font-medium text-slate-900">{item.assigned_warden.full_name}</div>
                            <div className="text-xs text-slate-500">{item.assigned_warden.hostel_block}</div>
                        </div>
                    ) : (
                        <span className="text-slate-400 text-xs">Not assigned</span>
                    )}
                </div>
            )
        },
        {
            header: 'Document',
            cell: (item: any) => item.document_url ? (
                <a
                    href={item.document_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-indigo-600 hover:text-indigo-800 underline text-sm font-medium"
                >
                    View
                </a>
            ) : (
                <span className="text-slate-400 text-xs">No document</span>
            )
        },
        {
            header: 'Status',
            cell: (item: LeaveRequest) => <StatusPill status={item.status} />
        },
        {
            header: 'Actions',
            cell: (item: LeaveRequest) => (
                <div className="flex gap-2">
                    {item.status === 'Pending' && (
                        <>
                            <button onClick={(e) => { e.stopPropagation(); handleStatusUpdate(item.id, 'Approved'); }} className="text-emerald-600 hover:text-emerald-800 font-medium text-sm">Approve</button>
                            <button onClick={(e) => { e.stopPropagation(); handleStatusUpdate(item.id, 'Rejected'); }} className="text-rose-600 hover:text-rose-800 font-medium text-sm">Reject</button>
                        </>
                    )}
                </div>
            )
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <nav className="bg-slate-900 border-b border-slate-800 sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center gap-2">
                            <div className="bg-indigo-500 p-2 rounded-lg">
                                <ShieldCheck className="h-5 w-5 text-white" />
                            </div>
                            <span className="font-bold text-xl text-white tracking-tight">Warden Admin</span>
                        </div>
                        <button onClick={handleLogout} className="text-slate-400 hover:text-white transition-colors">
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">All Requests</h1>
                        <p className="text-slate-500 mt-1">Review and manage student leave requests.</p>
                    </div>

                    {/* Filters & Actions */}
                    <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search student..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>

                        <div className="relative">
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value as any)}
                                className="w-full pl-3 pr-8 py-2 border border-slate-300 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500 appearance-none bg-white"
                            >
                                <option value="All">All Status</option>
                                <option value="Pending">Pending Only</option>
                                <option value="Approved">Approved Only</option>
                            </select>
                            <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                        </div>

                        {selectedIds.length > 0 && (
                            <button
                                onClick={handleBulkApprove}
                                className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg shadow-sm text-sm font-medium transition-colors animate-in fade-in zoom-in duration-200"
                            >
                                <CheckCircle className="w-4 h-4" />
                                Approve ({selectedIds.length})
                            </button>
                        )}
                    </div>
                </div>

                <ResponsiveTable
                    data={filteredRequests}
                    columns={columns}
                    keyExtractor={(item) => item.id.toString()} // Ensure string key for checkboxes
                    selectedIds={selectedIds}
                    onSelectRow={(id) => {
                        setSelectedIds(prev =>
                            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
                        );
                    }}
                    onSelectAll={(ids) => setSelectedIds(ids)}
                    mobileCardRender={(item) => (
                        <div className="relative">
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold">
                                        {item.users?.full_name?.charAt(0) || 'U'}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-slate-900">{item.users?.full_name}</h3>
                                        <p className="text-xs text-slate-500">{item.users?.register_number} • {item.users?.hostel_block}</p>
                                    </div>
                                </div>
                                <StatusPill status={item.status} />
                            </div>

                            <div className="space-y-2 text-sm text-slate-600 mb-4 bg-slate-50 p-3 rounded-md">
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Type</span>
                                    <span className="font-medium">{item.type}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Duration</span>
                                    <span className="font-medium">
                                        {format(new Date(item.out_date), 'MMM d')} - {format(new Date(item.in_date), 'MMM d')}
                                    </span>
                                </div>
                                <div className="pt-1">
                                    <span className="block text-slate-400 text-xs mb-1">Reason</span>
                                    <p className="leading-relaxed line-clamp-2">{item.reason}</p>
                                </div>
                            </div>

                            {item.status === 'Pending' && (
                                <div className="grid grid-cols-2 gap-3 mt-4">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleStatusUpdate(item.id, 'Approved'); }}
                                        className="flex items-center justify-center gap-2 py-2.5 bg-indigo-600 text-white rounded-lg font-medium shadow-sm active:scale-95 transition-all"
                                    >
                                        <CheckCircle className="w-4 h-4" /> Approve
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleStatusUpdate(item.id, 'Rejected'); }}
                                        className="flex items-center justify-center gap-2 py-2.5 bg-white border border-rose-200 text-rose-600 rounded-lg font-medium shadow-sm hover:bg-rose-50 active:scale-95 transition-all"
                                    >
                                        <XCircle className="w-4 h-4" /> Reject
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                />
            </main>
        </div>
    );
}
