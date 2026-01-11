'use client';

import { usePathname } from 'next/navigation';
import { RequireRole } from '@/components/auth/RequireRole';
import { Sidebar } from '@/components/Sidebar';

import TopBar from '@/components/TopBar';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    return (
        <RequireRole allowedRoles={['ADMIN']}>
            <div className="flex h-screen bg-gradient-to-br from-slate-50 to-blue-50">
                <Sidebar currentPath={pathname} />
                <div className="flex-1 flex flex-col min-w-0">
                    <TopBar />
                    <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gradient-to-br from-slate-50 to-blue-50 p-6">
                        <div className="max-w-7xl mx-auto">
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </RequireRole>
    );
}
