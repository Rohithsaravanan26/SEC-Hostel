'use client';

import { useState } from 'react';
import { XCircle } from 'lucide-react';

interface RejectModalProps {
    isOpen: boolean;
    studentName: string;
    onClose: () => void;
    onReject: (reason: string) => void;
}

export function RejectModal({ isOpen, studentName, onClose, onReject }: RejectModalProps) {
    const [reason, setReason] = useState('');
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = () => {
        if (!reason.trim()) {
            setError('Please provide a reason for rejection');
            return;
        }
        onReject(reason);
        setReason('');
        setError('');
    };

    const handleClose = () => {
        setReason('');
        setError('');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 sm:p-8 animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                            <XCircle className="w-7 h-7 text-rose-600" />
                            Reject Request
                        </h2>
                        <p className="text-sm text-slate-500 mt-1">Student: <span className="font-semibold">{studentName}</span></p>
                    </div>
                    <button onClick={handleClose} className="text-slate-400 hover:text-slate-600">
                        <XCircle className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Reason for Rejection <span className="text-rose-600">*</span>
                        </label>
                        <textarea
                            value={reason}
                            onChange={(e) => {
                                setReason(e.target.value);
                                setError('');
                            }}
                            placeholder="Please provide a clear reason for rejecting this request..."
                            className={`w-full px-4 py-3 border-2 rounded-xl resize-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 ${error ? 'border-rose-300 bg-rose-50' : 'border-slate-200'
                                }`}
                            rows={4}
                        />
                        {error && <p className="text-sm text-rose-600 mt-1 font-medium">{error}</p>}
                    </div>

                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                        <p className="text-xs text-amber-800">
                            ⚠️ The student will be able to see this rejection reason in their dashboard.
                        </p>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 mt-6">
                    <button
                        onClick={handleClose}
                        className="flex-1 py-3 px-4 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 active:scale-95 transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="flex-1 py-3 px-4 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white rounded-xl font-bold shadow-lg active:scale-95 transition-all"
                    >
                        Reject Request
                    </button>
                </div>
            </div>
        </div>
    );
}
