import { ReactNode } from 'react';
import TeacherSidebar from '../../components/TeacherSidebar';
import TeacherTopBar from '../../components/TeacherTopBar';

interface TeacherLayoutProps {
    children: ReactNode;
}

export default function TeacherLayout({ children }: TeacherLayoutProps) {
    return (
        <div className="flex h-screen bg-gradient-to-br from-slate-50 to-blue-50">
            <TeacherSidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <TeacherTopBar />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gradient-to-br from-slate-50 to-blue-50 p-6">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}