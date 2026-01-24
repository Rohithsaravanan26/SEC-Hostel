import Image from 'next/image';

export function Footer() {
    return (
        <footer className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-t border-slate-700">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
                    <p className="text-slate-400 text-sm font-medium">Built by</p>
                    <div className="flex items-center gap-3 bg-white/5 backdrop-blur-sm px-4 py-2.5 rounded-xl border border-white/10 hover:border-white/20 transition-all">
                        <Image
                            src="/corez-logo.png"
                            alt="Core Z"
                            width={120}
                            height={40}
                            className="h-8 w-auto"
                            priority
                        />
                    </div>
                </div>
                <p className="text-center text-xs text-slate-500 mt-4">
                    © {new Date().getFullYear()} SEC Hostel Management System. All rights reserved.
                </p>
            </div>
        </footer>
    );
}
