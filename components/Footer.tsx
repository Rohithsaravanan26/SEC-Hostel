import Image from 'next/image';

export function Footer() {
    return (
        <footer className="bg-slate-50 border-t border-slate-200 mt-auto">
            <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4">
                <div className="flex items-center justify-center gap-2 opacity-60 hover:opacity-100 transition-opacity">
                    <p className="text-xs text-slate-500">Built by</p>
                    <div className="flex items-center gap-1.5">
                        <div className="h-5 w-5 rounded-full overflow-hidden bg-white border border-slate-200 flex-shrink-0">
                            <Image
                                src="/corez-logo.png"
                                alt="Core Z"
                                width={20}
                                height={20}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <span className="text-xs font-semibold text-slate-700">Core Z</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}

