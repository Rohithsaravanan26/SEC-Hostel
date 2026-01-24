'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { ResponsiveTable } from '@/components/ui/ResponsiveTable';
import { StatusPill } from '@/components/ui/StatusPill';
import { NewRequestModal } from '@/components/NewRequestModal';
import { LogOut, Plus, ArrowRight, UserCircle, LayoutDashboard } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { LeaveRequest } from '@/types';

export default function DashboardPage() {
    const [requests, setRequests] = useState<LeaveRequest[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [user, setUser] = useState<any>(null); // Quick MVP user state
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        // MVP Auth Check
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/login');
                return;
            }
            setUser(user);
            fetchRequests(user.id);
        };
        checkUser();
    }, [router, supabase]);

    const fetchRequests = async (userId: string) => {
        const { data } = await supabase
            .from('leave_requests')
            .select('*')
            .eq('student_id', userId)
            .order('created_at', { ascending: false });

        if (data) setRequests(data as any);
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/login');
    };

    const columns = [
        { header: 'Type', accessorKey: 'type' as const },
        {
            header: 'Out Date',
            cell: (item: LeaveRequest) => format(new Date(item.out_date), 'MMM d, h:mm a')
        },
        {
            header: 'In Date',
            cell: (item: LeaveRequest) => format(new Date(item.in_date), 'MMM d, h:mm a')
        },
        { header: 'Reason', accessorKey: 'reason' as const, className: 'max-w-xs truncate' },
        {
            header: 'Status',
            cell: (item: LeaveRequest) => (
                <div>
                    <StatusPill status={item.status} />
                    {item.status === 'Rejected' && item.rejection_reason && (
                        <div className="mt-2 bg-rose-50 border border-rose-200 rounded-lg p-2">
                            <p className="text-xs text-rose-600 font-semibold uppercase tracking-wide mb-1">Rejection Reason</p>
                            <p className="text-sm text-rose-900">{item.rejection_reason}</p>
                        </div>
                    )}
                </div>
            )
        },
    ];

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <nav className="bg-white border-b border-slate-200 sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center gap-2">
                            <div className="bg-indigo-600 p-2 rounded-lg">
                                <LayoutDashboard className="h-5 w-5 text-white" />
                            </div>
                            <span className="font-bold text-xl text-slate-900 tracking-tight">Student Portal</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="hidden sm:flex flex-col items-end mr-2">
                                <p className="font-semibold text-sm text-slate-900">{user?.user_metadata?.full_name || user?.email}</p>
                                <p className="text-xs text-slate-500 font-medium">
                                    Parent: {user?.user_metadata?.parent_mobile || '+91 98765 43210'}
                                </p>
                            </div>
                            <div className="h-9 w-9 bg-indigo-100 rounded-full flex items-center justify-center border border-indigo-200 text-indigo-700 font-bold">
                                {user?.email?.charAt(0).toUpperCase()}
                            </div>
                            <button
                                onClick={() => router.push('/profile')}
                                className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
                                title="View Profile"
                            >
                                <UserCircle className="w-5 h-5" />
                            </button>
                            <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                                <LogOut className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">My Requests</h1>
                        <p className="text-slate-500 mt-1">Manage your outing and leave history.</p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg shadow-sm font-medium transition-all hover:shadow-md active:scale-95"
                    >
                        <Plus className="w-5 h-5" />
                        New Request
                    </button>
                </div>

                <ResponsiveTable
                    data={requests}
                    columns={columns}
                    keyExtractor={(item) => item.id.toString()}
                    onRowClick={(item) => {
                        if (item.status === 'Approved') {
                            router.push(`/pass/${item.id}`);
                        }
                    }}
                    mobileCardRender={(item) => (
                        <>
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="font-semibold text-slate-900 flex items-center gap-2">
                                        {item.type}
                                        <StatusPill status={item.status} className="scale-90 origin-left" />
                                    </div>
                                    <p className="text-sm text-slate-500 mt-1 line-clamp-1">{item.reason}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-slate-600 pt-2 border-t border-slate-50 mt-2">
                                <div className="flex-1">
                                    <span className="block text-xs text-slate-400 uppercase">Out</span>
                                    <span className="font-medium">{format(new Date(item.out_date), 'MMM d, h:mm a')}</span>
                                </div>
                                <div className="w-px h-8 bg-slate-100" />
                                <div className="flex-1">
                                    <span className="block text-xs text-slate-400 uppercase">In</span>
                                    <span className="font-medium">{format(new Date(item.in_date), 'MMM d, h:mm a')}</span>
                                </div>
                            </div>
                            {item.status === 'Rejected' && item.rejection_reason && (
                                <div className="mt-3 bg-rose-50 border border-rose-200 rounded-lg p-3">
                                    <p className="text-xs text-rose-600 font-bold uppercase tracking-wide mb-1.5">❌ Rejection Reason</p>
                                    <p className="text-sm text-rose-900 leading-relaxed">{item.rejection_reason}</p>
                                </div>
                            )}
                        </>
                    )}
                />
            </main>

            <NewRequestModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    if (user) fetchRequests(user.id);
                }}
                userId={user?.id}
            />
        </div>
    );
}
