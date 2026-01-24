'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { ResponsiveTable } from '@/components/ui/ResponsiveTable';
import { StatusPill } from '@/components/ui/StatusPill';
import { RejectModal } from '@/components/RejectModal';
import { CheckCircle, XCircle, LogOut, ShieldCheck, Search, Filter } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { LeaveRequest, User } from '@/types';
import { cn } from '@/lib/utils';

export default function WardenPage() {
    const [requests, setRequests] = useState<(LeaveRequest & { users: User; assigned_warden?: User })[]>([]);
    const [selectedIds, setSelectedIds] = useState<(string | number)[]>([]); // ResponsiveTable uses string|number
    const [filterStatus, setFilterStatus] = useState<'All' | 'Pending' | 'Approved'>('Pending'); // Default to Pending for efficiency
    const [searchQuery, setSearchQuery] = useState('');
    const [rejectModalOpen, setRejectModalOpen] = useState(false);
    const [requestToReject, setRequestToReject] = useState<(LeaveRequest & { users: User }) | null>(null);
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
        if (status === 'Rejected') {
            // Open rejection modal
            const request = requests.find(r => r.id === id);
            if (request) {
                setRequestToReject(request);
                setRejectModalOpen(true);
            }
            return;
        }

        // For approval, directly update
        await supabase.from('leave_requests').update({ status }).eq('id', id);
        fetchRequests(); // Refresh
    };

    const handleReject = async (reason: string) => {
        if (!requestToReject) return;

        await supabase
            .from('leave_requests')
            .update({
                status: 'Rejected',
                rejection_reason: reason
            })
            .eq('id', requestToReject.id);

        setRejectModalOpen(false);
        setRequestToReject(null);
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
                    <div className="text-xs text-slate-500">
                        {item.users?.register_number} • {item.users?.hostel_block} - {item.users?.room_number}
                    </div>
                    {item.users?.parent_mobile && (
                        <a
                            href={`tel:${item.users.parent_mobile}`}
                            onClick={(e) => e.stopPropagation()}
                            className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1 mt-1"
                        >
                            📞 {item.users.parent_mobile}
                        </a>
                    )}
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

            <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
                {/* Stats Overview - Mobile Optimized */}
                <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-6">
                    <div className="bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 rounded-xl p-3 sm:p-4">
                        <p className="text-xs sm:text-sm text-amber-700 font-medium mb-1">Pending</p>
                        <p className="text-xl sm:text-2xl font-bold text-amber-900">{requests.filter(r => r.status === 'Pending').length}</p>
                    </div>
                    <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 rounded-xl p-3 sm:p-4">
                        <p className="text-xs sm:text-sm text-emerald-700 font-medium mb-1">Approved</p>
                        <p className="text-xl sm:text-2xl font-bold text-emerald-900">{requests.filter(r => r.status === 'Approved').length}</p>
                    </div>
                    <div className="bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 rounded-xl p-3 sm:p-4">
                        <p className="text-xs sm:text-sm text-slate-700 font-medium mb-1">Total</p>
                        <p className="text-xl sm:text-2xl font-bold text-slate-900">{requests.length}</p>
                    </div>
                </div>

                <div className="flex flex-col gap-4 mb-6">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">All Requests</h1>
                        <p className="text-sm text-slate-500 mt-1">Review and manage student leave requests.</p>
                    </div>

                    {/* Filters & Actions - Mobile Optimized */}
                    <div className="flex flex-col gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search by name or register number..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 border-2 border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white shadow-sm"
                            />
                        </div>

                        <div className="flex gap-3">
                            <div className="relative flex-1">
                                <select
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value as any)}
                                    className="w-full pl-3 pr-10 py-3 border-2 border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none bg-white shadow-sm"
                                >
                                    <option value="All">All Status</option>
                                    <option value="Pending">Pending Only</option>
                                    <option value="Approved">Approved Only</option>
                                </select>
                                <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                            </div>

                            {selectedIds.length > 0 && (
                                <button
                                    onClick={handleBulkApprove}
                                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white px-5 py-3 rounded-xl shadow-lg text-sm font-bold transition-all active:scale-95"
                                >
                                    <CheckCircle className="w-5 h-5" />
                                    <span className="hidden sm:inline">Approve</span> ({selectedIds.length})
                                </button>
                            )}
                        </div>
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
                        <div className="relative bg-white">
                            {/* Student Info Header */}
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-start gap-3 flex-1">
                                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-200 flex items-center justify-center text-indigo-700 font-bold text-lg flex-shrink-0">
                                        {item.users?.full_name?.charAt(0) || 'U'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-slate-900 text-base">{item.users?.full_name}</h3>
                                        <p className="text-xs text-slate-500 mt-0.5">
                                            {item.users?.register_number}
                                        </p>
                                        <p className="text-xs text-slate-600 font-medium mt-0.5">
                                            {item.users?.hostel_block} - Room {item.users?.room_number}
                                        </p>
                                        {item.users?.parent_mobile && (
                                            <a
                                                href={`tel:${item.users.parent_mobile}`}
                                                onClick={(e) => e.stopPropagation()}
                                                className="inline-flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 font-semibold mt-2 bg-indigo-50 px-2.5 py-1.5 rounded-lg active:scale-95 transition-all"
                                            >
                                                📞 {item.users.parent_mobile}
                                            </a>
                                        )}
                                    </div>
                                </div>
                                <StatusPill status={item.status} />
                            </div>

                            {/* Request Details */}
                            <div className="space-y-2.5 mb-4 bg-gradient-to-br from-slate-50 to-slate-100 p-4 rounded-xl border border-slate-200">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-slate-500 font-medium uppercase tracking-wide">Type</span>
                                    <span className="font-bold text-slate-900">{item.type}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-slate-500 font-medium uppercase tracking-wide">Duration</span>
                                    <div className="text-right">
                                        <div className="font-semibold text-slate-900 text-sm">
                                            {format(new Date(item.out_date), 'MMM d')} - {format(new Date(item.in_date), 'MMM d')}
                                        </div>
                                        <div className="text-xs text-slate-500">
                                            {format(new Date(item.out_date), 'h:mm a')}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-between items-start">
                                    <span className="text-xs text-slate-500 font-medium uppercase tracking-wide">Assigned To</span>
                                    <span className="font-medium text-right">
                                        {item.assigned_warden ? (
                                            <div>
                                                <div className="text-slate-900 text-sm font-semibold">{item.assigned_warden.full_name}</div>
                                                <div className="text-xs text-slate-500">{item.assigned_warden.hostel_block}</div>
                                            </div>
                                        ) : (
                                            <span className="text-slate-400 text-xs">Not assigned</span>
                                        )}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center pt-1 border-t border-slate-200">
                                    <span className="text-xs text-slate-500 font-medium uppercase tracking-wide">Document</span>
                                    {item.document_url ? (
                                        <a
                                            href={item.document_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onClick={(e) => e.stopPropagation()}
                                            className="text-indigo-600 hover:text-indigo-800 font-bold text-sm underline"
                                        >
                                            View →
                                        </a>
                                    ) : (
                                        <span className="text-slate-400 text-xs">No document</span>
                                    )}
                                </div>
                            </div>

                            {/* Reason */}
                            <div className="mb-4">
                                <span className="block text-xs text-slate-500 font-medium uppercase tracking-wide mb-1.5">Reason</span>
                                <p className="text-sm text-slate-700 leading-relaxed bg-white border border-slate-200 p-3 rounded-lg">
                                    {item.reason}
                                </p>
                            </div>

                            {/* Action Buttons - More Prominent */}
                            {item.status === 'Pending' && (
                                <div className="grid grid-cols-2 gap-3 mt-4">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleStatusUpdate(item.id, 'Approved'); }}
                                        className="flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-xl font-bold shadow-lg active:scale-95 transition-all"
                                    >
                                        <CheckCircle className="w-5 h-5" />
                                        Approve
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleStatusUpdate(item.id, 'Rejected'); }}
                                        className="flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white rounded-xl font-bold shadow-lg active:scale-95 transition-all"
                                    >
                                        <XCircle className="w-5 h-5" />
                                        Reject
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                />
            </main>

            {/* Rejection Modal */}
            <RejectModal
                isOpen={rejectModalOpen}
                studentName={requestToReject?.users?.full_name || 'Student'}
                onClose={() => {
                    setRejectModalOpen(false);
                    setRequestToReject(null);
                }}
                onReject={handleReject}
            />
        </div>
    );
}
