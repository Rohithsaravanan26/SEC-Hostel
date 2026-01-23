'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase';
import { uploadFile } from '@/lib/storage';
import { Loader2, Upload, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface NewRequestModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string;
}

export function NewRequestModal({ isOpen, onClose, userId }: NewRequestModalProps) {
    const [type, setType] = useState<'Outing' | 'Leave'>('Outing');
    const [reason, setReason] = useState('');
    const [outDate, setOutDate] = useState('');
    const [inDate, setInDate] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            let documentUrl = null;
            if (file) {
                documentUrl = await uploadFile(file);
            } else {
                alert("Please upload a supporting document.");
                setLoading(false);
                return;
            }

            const supabase = createClient();
            const { error } = await supabase.from('leave_requests').insert({
                student_id: userId,
                type,
                reason,
                out_date: new Date(outDate).toISOString(),
                in_date: new Date(inDate).toISOString(),
                status: 'Pending',
                document_url: documentUrl,
            });

            if (error) throw error;

            router.refresh();
            onClose();
        } catch (error) {
            console.error('Error creating request:', error);
            alert('Failed to create request');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-slate-100">
                    <h2 className="text-lg font-semibold text-slate-900">New Request</h2>
                    <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Request Type</label>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="type"
                                    value="Outing"
                                    checked={type === 'Outing'}
                                    onChange={() => setType('Outing')}
                                    className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-slate-300"
                                />
                                <span className="text-sm text-slate-600">Outing</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="type"
                                    value="Leave"
                                    checked={type === 'Leave'}
                                    onChange={() => setType('Leave')}
                                    className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-slate-300"
                                />
                                <span className="text-sm text-slate-600">Leave</span>
                            </label>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700">Reason</label>
                        <textarea
                            required
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                            placeholder="Going home for weekend..."
                            rows={3}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-slate-700">Out Date</label>
                            <input
                                type="datetime-local"
                                required
                                value={outDate}
                                onChange={(e) => setOutDate(e.target.value)}
                                className="w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-slate-700">In Date</label>
                            <input
                                type="datetime-local"
                                required
                                value={inDate}
                                onChange={(e) => setInDate(e.target.value)}
                                className="w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700">Supporting Document <span className="text-rose-500">*</span></label>
                        <div className="flex items-center justify-center w-full">
                            <label className={cn(
                                "flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-all",
                                file ? "border-indigo-300 bg-indigo-50" : "border-slate-300 bg-slate-50 hover:bg-slate-100"
                            )}>
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    {file ? (
                                        <div className="text-sm text-indigo-600 flex flex-col items-center gap-2">
                                            <div className="p-2 bg-white rounded-full shadow-sm">
                                                <Upload className="w-5 h-5" />
                                            </div>
                                            <span className="font-medium">{file.name}</span>
                                        </div>
                                    ) : (
                                        <>
                                            <Upload className="w-8 h-8 mb-3 text-slate-400" />
                                            <p className="text-sm text-slate-500 mb-1"><span className="font-semibold text-indigo-600">Click to upload</span> or drag and drop</p>
                                            <p className="text-xs text-slate-400">PDF, PNG, JPG (MAX. 5MB)</p>
                                        </>
                                    )}
                                </div>
                                <input
                                    type="file"
                                    className="hidden"
                                    accept=".pdf,.png,.jpg,.jpeg"
                                    required
                                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                                />
                            </label>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className={cn(
                                "flex-1 flex justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors shadow-sm",
                                loading && "opacity-75 cursor-wait"
                            )}
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Submit Request'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
