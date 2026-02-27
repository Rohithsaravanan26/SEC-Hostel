'use client';

import { useEffect, useState, useRef } from 'react';
import { createClient } from '@/lib/supabase';
import { uploadProfilePhoto } from '@/lib/storage';
import { User } from '@/types';
import { useRouter } from 'next/navigation';
import { Footer } from '@/components/Footer';
import { ArrowLeft, User as UserIcon, Phone, MapPin, Droplet, GraduationCap, Home, IdCard, Camera, Loader2, Fingerprint, Building2, Calendar } from 'lucide-react';

export default function ProfilePage() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        const { data: session } = await supabase.auth.getSession();
        if (!session.session) {
            router.push('/login');
            return;
        }

        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.session.user.id)
            .single();

        if (error) {
            console.error('Error fetching profile:', error);
        } else {
            setUser(data);
        }
        setLoading(false);
    };

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !user) return;

        setUploading(true);
        setUploadError(null);

        try {
            const publicUrl = await uploadProfilePhoto(file, user.id);
            setUser({ ...user, profile_pic_url: publicUrl });
        } catch (err: any) {
            setUploadError(err.message || 'Failed to upload photo');
        } finally {
            setUploading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-slate-600">Loading...</div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-slate-600">User not found</div>
            </div>
        );
    }

    const hasPhoto = !!user.profile_pic_url;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-slate-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-4 py-6 sm:px-6">
                <div className="max-w-4xl mx-auto">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-indigo-100 hover:text-white mb-4 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Back
                    </button>
                    <div className="flex items-center gap-4">
                        {/* Profile Photo or Upload Prompt */}
                        <div className="relative group">
                            {hasPhoto ? (
                                <img
                                    src={user.profile_pic_url!}
                                    alt={user.full_name}
                                    className="h-20 w-20 rounded-full object-cover border-2 border-white/30"
                                />
                            ) : (
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="h-20 w-20 rounded-full bg-white/20 backdrop-blur-sm flex flex-col items-center justify-center cursor-pointer hover:bg-white/30 transition-colors border-2 border-dashed border-white/40"
                                >
                                    {uploading ? (
                                        <Loader2 className="w-6 h-6 animate-spin" />
                                    ) : (
                                        <>
                                            <Camera className="w-5 h-5 mb-0.5" />
                                            <span className="text-[10px] font-medium">Upload</span>
                                        </>
                                    )}
                                </div>
                            )}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/jpeg,image/png"
                                title="Upload profile photo"
                                className="hidden"
                                onChange={handlePhotoUpload}
                                disabled={uploading}
                            />
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold">{user.full_name}</h1>
                            <p className="text-indigo-100 mt-1">{user.register_number}</p>
                        </div>
                    </div>
                    {uploadError && (
                        <div className="mt-3 bg-red-500/20 border border-red-400/30 rounded-lg px-3 py-2 text-sm">
                            {uploadError}
                        </div>
                    )}
                    {!hasPhoto && !uploading && (
                        <div className="mt-3 bg-amber-500/20 border border-amber-400/30 rounded-lg px-3 py-2 text-sm flex items-center gap-2">
                            <Camera className="w-4 h-4" />
                            Please upload your profile photo (one-time only)
                        </div>
                    )}
                </div>
            </div>

            {/* Profile Content */}
            <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6">
                <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
                    {/* Personal Information */}
                    <div className="p-6 sm:p-8">
                        <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <UserIcon className="w-6 h-6 text-indigo-600" />
                            Personal Information
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <ProfileField icon={<IdCard />} label="Register Number" value={user.register_number} />
                            <ProfileField icon={<Building2 />} label="Department" value={user.department || user.course || 'Not specified'} />
                            <ProfileField icon={<Calendar />} label="Year" value={user.year || 'Not specified'} />
                            <ProfileField icon={<Phone />} label="Student Mobile" value={user.student_mobile || 'Not specified'} isPhone />
                            <ProfileField icon={<Droplet />} label="Blood Group" value={user.blood_group || 'Not specified'} />
                            <ProfileField icon={<Fingerprint />} label="Bio-Metric Number" value={user.bio_metric_number || 'Not specified'} />
                        </div>
                    </div>

                    {/* Hostel Information */}
                    <div className="p-6 sm:p-8 bg-slate-50 border-t border-slate-200">
                        <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <Home className="w-6 h-6 text-indigo-600" />
                            Hostel Information
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <ProfileField label="Hostel Block" value={user.hostel_block || 'Not assigned'} />
                            <ProfileField label="Room Number" value={user.room_number || 'Not assigned'} />
                            {user.floor_incharge && (
                                <ProfileField label="Floor Incharge" value={user.floor_incharge} />
                            )}
                        </div>
                    </div>

                    {/* Contact Information */}
                    <div className="p-6 sm:p-8 border-t border-slate-200">
                        <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <Phone className="w-6 h-6 text-indigo-600" />
                            Emergency Contact
                        </h2>

                        <div className="grid grid-cols-1 gap-6">
                            <ProfileField icon={<Phone />} label="Parent/Guardian Mobile" value={user.parent_mobile || 'Not specified'} isPhone />
                            <ProfileField icon={<MapPin />} label="Permanent Address" value={user.address || 'Not specified'} isAddress />
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}

function ProfileField({ icon, label, value, isPhone = false, isAddress = false }: {
    icon?: React.ReactNode;
    label: string;
    value: string | null;
    isPhone?: boolean;
    isAddress?: boolean;
}) {
    return (
        <div className={isAddress ? 'md:col-span-2' : ''}>
            <div className="flex items-start gap-3">
                {icon && <div className="text-indigo-600 mt-1">{icon}</div>}
                <div className="flex-1">
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wide mb-1">{label}</p>
                    {isPhone && value && value !== 'Not specified' ? (
                        <a
                            href={`tel:${value}`}
                            className="text-base font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-2"
                        >
                            📞 {value}
                        </a>
                    ) : (
                        <p className={`text-base font-semibold ${value === 'Not specified' ? 'text-slate-400 italic' : 'text-slate-900'} ${isAddress ? 'leading-relaxed' : ''}`}>
                            {value}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
