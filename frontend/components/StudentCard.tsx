import React from 'react';
import QRCode from 'react-qr-code';

interface StudentCardProps {
    student: {
        id: number;
        name: string;
        surname: string;
    };
    schoolName?: string;
    schoolLogo?: string;
}

export default function StudentCard({ student, schoolName = "ArwaEduc", schoolLogo }: StudentCardProps) {
    const qrValue = `STUDENT:${student.id}`;

    return (
        <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md mx-auto border-4 border-gradient-to-r from-blue-500 to-purple-600 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500 rounded-full -translate-y-16 translate-x-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-500 rounded-full translate-y-12 -translate-x-12"></div>
            </div>

            {/* Header with school info */}
            <div className="relative text-center mb-6">
                {schoolLogo && (
                    <img src={schoolLogo} alt="School Logo" className="w-20 h-20 mx-auto mb-3 rounded-full border-4 border-white shadow-lg" />
                )}
                <h1 className="text-2xl font-bold text-gray-800 mb-1">{schoolName}</h1>
                <p className="text-sm text-gray-600 font-medium">CARTE D'ÉTUDIANT</p>
                <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-600 mx-auto mt-2 rounded-full"></div>
            </div>

            {/* Student Avatar and Name */}
            <div className="text-center mb-6 relative">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center border-4 border-white shadow-lg mx-auto mb-4">
                    <span className="text-6xl font-bold text-blue-600">
                        {student.name.charAt(0)}
                    </span>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 leading-tight">
                    {student.name} {student.surname}
                </h2>
                <p className="text-sm text-gray-600">ID: <span className="font-semibold">{student.id.toString().padStart(6, '0')}</span></p>
            </div>

            {/* QR Code Section */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6 relative">
                <div className="text-center mb-3">
                    <h3 className="text-sm font-semibold text-gray-700">Code QR d'identification</h3>
                </div>
                <div className="flex justify-center">
                    <div className="bg-white p-3 rounded-lg border-2 border-gray-200 shadow-sm">
                        <QRCode
                            value={qrValue}
                            size={120}
                            style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                        />
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="text-center space-y-2">
                <div className="flex items-center justify-center gap-2 text-xs text-gray-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Carte valide pour les séances autorisées</span>
                </div>
                <p className="text-xs text-gray-500">
                    En cas de perte, contactez l'administration
                </p>
                <div className="pt-2 border-t border-gray-200">
                    <p className="text-xs text-gray-400">
                        Émis le {new Date().toLocaleDateString('fr-FR')}
                    </p>
                </div>
            </div>
        </div>
    );
}