'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Loader2, Phone, Fingerprint } from 'lucide-react';
import { cn } from '@/lib/utils';

const EMAIL_DOMAIN = 'sec-hostel.local';

export default function LoginPage() {
    const [mobile, setMobile] = useState('');
    const [bioMetric, setBioMetric] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const supabase = createClient();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Validate mobile number
        const cleanMobile = mobile.replace(/\D/g, '');
        if (cleanMobile.length !== 10) {
            setError('Please enter a valid 10-digit mobile number');
            setLoading(false);
            return;
        }

        try {
            // Construct synthetic email from mobile number
            const syntheticEmail = `${cleanMobile}@${EMAIL_DOMAIN}`;

            const { data, error } = await supabase.auth.signInWithPassword({
                email: syntheticEmail,
                password: bioMetric,
            });

            if (error) {
                if (error.message?.includes('Invalid login credentials')) {
                    throw new Error('Invalid mobile number or bio-metric number. Please check your credentials.');
                }
                throw error;
            }

            // Fetch user role and redirect
            const { data: userData, error: userError } = await supabase
                .from('users')
                .select('role')
                .eq('id', data.user.id)
                .single();

            if (userError) {
                // Fallback: check user metadata
                const role = data.user.user_metadata?.role;
                if (role === 'warden') {
                    router.push('/warden');
                } else {
                    router.push('/dashboard');
                }
            } else {
                if (userData?.role === 'warden') {
                    router.push('/warden');
                } else {
                    router.push('/dashboard');
                }
            }

        } catch (err: any) {
            setError(err.message || 'Failed to sign in');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen w-full">
            {/* Left Panel - Image */}
            <div className="hidden lg:flex w-1/2 bg-slate-900 relative items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-slate-900/90 z-10" />
                <div className="relative z-20 text-white p-12">
                    <h1 className="text-4xl font-bold mb-4 tracking-tight">SEC Hostel Portal</h1>
                    <p className="text-lg text-slate-300 max-w-md leading-relaxed">
                        Seamless leave management and digital passes for a smarter campus experience.
                    </p>
                </div>
            </div>

            {/* Right Panel - Form */}
            <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:px-20 xl:px-24 bg-white">
                <div className="mx-auto w-full max-w-sm lg:w-96 space-y-8">
                    <div>
                        <h2 className="mt-6 text-3xl font-extrabold text-slate-900 tracking-tight">
                            Sign in to your account
                        </h2>
                        <p className="mt-2 text-sm text-slate-600">
                            Use your mobile number and bio-metric number to login.
                        </p>
                    </div>

                    <form className="space-y-6" onSubmit={handleLogin}>
                        <div>
                            <label htmlFor="mobile" className="block text-sm font-medium text-slate-700">
                                <span className="flex items-center gap-1.5">
                                    <Phone className="w-4 h-4" />
                                    Mobile Number
                                </span>
                            </label>
                            <div className="mt-1">
                                <input
                                    id="mobile"
                                    name="mobile"
                                    type="tel"
                                    inputMode="numeric"
                                    pattern="[0-9]{10}"
                                    maxLength={10}
                                    autoComplete="tel"
                                    required
                                    placeholder="Enter 10-digit mobile number"
                                    value={mobile}
                                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                                    className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="biometric" className="block text-sm font-medium text-slate-700">
                                <span className="flex items-center gap-1.5">
                                    <Fingerprint className="w-4 h-4" />
                                    Bio-Metric Number
                                </span>
                            </label>
                            <div className="mt-1">
                                <input
                                    id="biometric"
                                    name="biometric"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    placeholder="Enter your bio-metric number"
                                    value={bioMetric}
                                    onChange={(e) => setBioMetric(e.target.value)}
                                    className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md border border-red-200">
                                {error}
                            </div>
                        )}

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className={cn(
                                    "w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all",
                                    loading && "opacity-70 cursor-not-allowed"
                                )}
                            >
                                {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Sign in'}
                            </button>
                        </div>
                    </form>

                    <div className="mt-4 text-center">
                        <p className="text-xs text-slate-400">
                            Contact your warden if you need access or face login issues.
                        </p>
                    </div>

                </div>
            </div>
        </div>
    );
}
