'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { useParams, useRouter } from 'next/navigation'; // Correct hook for app router
import { format } from 'date-fns';
import { Loader2, ArrowRight, ArrowLeft } from 'lucide-react';
import { LeaveRequest, User } from '@/types';
import { cn } from '@/lib/utils';
// import Image from 'next/image'; // Assuming we have images, else user avatar

export default function DigitalPassPage() {
    const { id } = useParams();
    const router = useRouter();
    const [request, setRequest] = useState<LeaveRequest & { users: User } | null>(null);
    const [loading, setLoading] = useState(true);
    const [time, setTime] = useState(new Date());
    const supabase = createClient();

    // Live Clock
    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (id) fetchPass();
    }, [id]);

    const fetchPass = async () => {
        const { data, error } = await supabase
            .from('leave_requests')
            .select('*, users!leave_requests_student_id_fkey(id, full_name, register_number, role, hostel_block, room_number, parent_mobile, profile_pic_url)')
            .eq('id', id)
            .single();

        if (error) {
            console.error('Error fetching pass:', error);
        }

        if (data) setRequest(data as any);
        setLoading(false);
    };

    const updateTime = async (field: 'actual_out_time') => {
        if (!id || !request) return;

        // CRITICAL SECURITY: Verify status is Approved
        if (request.status !== 'Approved') {
            alert('Cannot check in/out for non-approved requests');
            return;
        }

        const now = new Date();
        const outDate = new Date(request.out_date);
        const inDate = new Date(request.in_date);

        // CRITICAL: Validate check-out time
        if (field === 'actual_out_time') {
            // Prevent double punch
            if (request.actual_out_time) {
                alert('Already checked out at ' + format(new Date(request.actual_out_time), 'MMM d, h:mm a'));
                return;
            }

            // Prevent early check-out (more than 1 hour before scheduled out_date)
            const oneHourBefore = new Date(outDate.getTime() - (60 * 60 * 1000));
            if (now < oneHourBefore) {
                alert(`Cannot check out before ${format(oneHourBefore, 'MMM d, h:mm a')}`);
                return;
            }

            // Prevent late check-out (after scheduled return date)
            if (now > inDate) {
                alert('Cannot check out after scheduled return time. Please contact warden.');
                return;
            }
        }

        // Perform update with additional server-side checks via RLS
        const { error } = await supabase
            .from('leave_requests')
            .update({ [field]: now.toISOString() })
            .eq('id', id)
            .eq('status', 'Approved') // Extra server-side verification
            .is(field, null); // Ensure field is null (prevent double-punch at DB level)

        if (error) {
            console.error('Update error:', error);
            alert('Failed to update check-in/out time. Please try again or contact support.');
            return;
        }

        // Refresh pass data
        fetchPass();
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-indigo-600" /></div>;
    if (!request) return <div className="min-h-screen flex items-center justify-center">Pass not found</div>;

    const isApproved = request.status === 'Approved';

    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
            <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200">

                {/* Header - Boarding Pass Style */}
                <div className={cn(
                    "p-6 text-white text-center relative overflow-hidden",
                    isApproved ? "bg-indigo-600" : "bg-slate-500"
                )}>
                    <div className="absolute inset-0 bg-white/10 opacity-50 backdrop-blur-3xl" />
                    <div className="relative z-10">
                        <h1 className="text-2xl font-bold tracking-widest uppercase mb-1">Gate Pass</h1>
                        <p className="opacity-80 text-sm">{isApproved ? 'AUTHORIZED ENTRY' : 'UNAUTHORIZED'}</p>
                    </div>
                </div>

                {/* User Info */}
                <div className="px-6 py-8 text-center border-b border-dashed border-slate-200 relative">
                    {/* Cutouts for ticket effect */}
                    <div className="absolute -left-3 top-[-12px] w-6 h-6 bg-slate-100 rounded-full" />
                    <div className="absolute -right-3 top-[-12px] w-6 h-6 bg-slate-100 rounded-full" />

                    <div className="w-24 h-24 bg-slate-200 rounded-full mx-auto mb-4 border-4 border-white shadow-lg flex items-center justify-center text-3xl font-bold text-slate-500">
                        {request.users.full_name.charAt(0)}
                    </div>
                    <h2 className="text-xl font-bold text-slate-900">{request.users.full_name}</h2>
                    <p className="text-slate-500 font-mono text-sm mt-1">{request.users.register_number}</p>
                    <div className="inline-block mt-3 px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-semibold uppercase tracking-wide">
                        {request.users.hostel_block} • {request.users.room_number}
                    </div>
                </div>

                {/* Live Clock & Details */}
                <div className="p-6 space-y-6">
                    <div className="text-center">
                        <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">Current Time</p>
                        <div className="text-4xl font-mono font-bold text-slate-900 tracking-wider">
                            {format(time, 'HH:mm:ss')}
                        </div>
                        <p className="text-xs text-indigo-600 font-medium mt-1">{format(time, 'EEEE, MMM d, yyyy')}</p>
                    </div>

                    {/* Pass Schedule - Enhanced for Mobile */}
                    <div className="bg-slate-50 rounded-xl p-4 space-y-3 border border-slate-100">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center mb-3">Pass Schedule</h3>

                        {/* Out Date & Time */}
                        <div className="bg-white rounded-lg p-3 border border-slate-200">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <ArrowRight className="w-4 h-4 text-indigo-600" />
                                    <span className="text-xs text-slate-500 uppercase font-semibold">Departure</span>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold text-slate-900">{format(new Date(request.out_date), 'MMM d, yyyy')}</p>
                                    <p className="text-lg font-mono font-bold text-indigo-600">{format(new Date(request.out_date), 'h:mm a')}</p>
                                </div>
                            </div>
                        </div>

                        {/* In Date & Time */}
                        <div className="bg-white rounded-lg p-3 border border-slate-200">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <ArrowLeft className="w-4 h-4 text-emerald-600" />
                                    <span className="text-xs text-slate-500 uppercase font-semibold">Return</span>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold text-slate-900">{format(new Date(request.in_date), 'MMM d, yyyy')}</p>
                                    <p className="text-lg font-mono font-bold text-emerald-600">{format(new Date(request.in_date), 'h:mm a')}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Check In/Out Buttons */}
                    {isApproved && (
                        <div className="space-y-3 pt-2">
                            {!request.actual_out_time ? (
                                <button
                                    onClick={() => updateTime('actual_out_time')}
                                    className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg shadow-lg hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-2"
                                >
                                    CHECK OUT <ArrowRight className="w-5 h-5" />
                                </button>
                            ) : (
                                <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 border-2 border-emerald-200 p-4 rounded-xl mb-2">
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                                        <p className="text-xs text-emerald-700 uppercase font-bold tracking-wide">Checked Out</p>
                                    </div>
                                    <p className="text-emerald-900 font-bold text-lg">{format(new Date(request.actual_out_time), 'MMM d, yyyy')}</p>
                                    <p className="text-emerald-700 font-mono text-2xl">{format(new Date(request.actual_out_time), 'h:mm a')}</p>
                                </div>
                            )}

                            {/* Check In button removed as per requirement */}

                            {request.actual_in_time && (
                                <div className="bg-gradient-to-r from-slate-100 to-slate-200 border-2 border-slate-300 p-4 rounded-xl">
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
                                        <p className="text-xs text-slate-600 uppercase font-bold tracking-wide">Pass Closed - Returned</p>
                                    </div>
                                    <p className="text-slate-900 font-bold text-lg">{format(new Date(request.actual_in_time), 'MMM d, yyyy')}</p>
                                    <p className="text-slate-700 font-mono text-2xl">{format(new Date(request.actual_in_time), 'h:mm a')}</p>
                                </div>
                            )}

                            {/* Close button */}
                            <button
                                onClick={() => router.back()}
                                className="w-full py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 active:scale-95 transition-all border border-slate-200 mt-2"
                            >
                                Close
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
