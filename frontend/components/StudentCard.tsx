import React from 'react';
import QRCode from 'react-qr-code';

interface StudentCardProps {
    student: {
        id: number;
        name: string;
        surname: string;
        schoolLevel?: string;
        photo?: string;
        currentSchool?: string;
        phone?: string;
        email?: string;
        cin?: string;
        address?: string;
        birthDate?: string;
        birthPlace?: string;
        fatherName?: string;
        motherName?: string;
    };
    schoolName?: string;
    schoolLogo?: string;
}

export default function StudentCard({ student, schoolName = "ArwaEduc", schoolLogo }: StudentCardProps) {
    const qrValue = `STUDENT:${student.id}`;

    // Format birth date
    const formatDate = (dateString?: string) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('fr-FR');
    };

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

            {/* Student Photo and Basic Info */}
            <div className="flex gap-4 mb-6 relative">
                {/* Photo */}
                <div className="flex-shrink-0">
                    {student.photo ? (
                        <img
                            src={student.photo}
                            alt={`${student.name} ${student.surname}`}
                            className="w-28 h-28 rounded-lg object-cover border-4 border-white shadow-lg"
                        />
                    ) : (
                        <div className="w-28 h-28 rounded-lg bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center border-4 border-white shadow-lg">
                            <span className="text-3xl font-bold text-blue-600">
                                {student.name.charAt(0)}{student.surname.charAt(0)}
                            </span>
                        </div>
                    )}
                </div>

                {/* Basic Info */}
                <div className="flex-1 space-y-2">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800 leading-tight">
                            {student.name} {student.surname}
                        </h2>
                        <p className="text-sm text-gray-600">ID: <span className="font-semibold">{student.id.toString().padStart(6, '0')}</span></p>
                    </div>

                    {student.schoolLevel && (
                        <div className="bg-blue-50 px-3 py-1 rounded-md">
                            <p className="text-sm font-medium text-blue-800">Niveau: {student.schoolLevel}</p>
                        </div>
                    )}

                    {student.currentSchool && (
                        <p className="text-xs text-gray-600">{student.currentSchool}</p>
                    )}
                </div>
            </div>

            {/* Detailed Information */}
            <div className="space-y-3 mb-6">
                <div className="grid grid-cols-2 gap-3 text-sm">
                    {student.phone && (
                        <div>
                            <span className="text-gray-500 block">Téléphone</span>
                            <span className="font-medium text-gray-800">{student.phone}</span>
                        </div>
                    )}
                    {student.cin && (
                        <div>
                            <span className="text-gray-500 block">CIN</span>
                            <span className="font-medium text-gray-800">{student.cin}</span>
                        </div>
                    )}
                    {student.birthDate && (
                        <div>
                            <span className="text-gray-500 block">Date de naissance</span>
                            <span className="font-medium text-gray-800">{formatDate(student.birthDate)}</span>
                        </div>
                    )}
                    {student.birthPlace && (
                        <div>
                            <span className="text-gray-500 block">Lieu de naissance</span>
                            <span className="font-medium text-gray-800">{student.birthPlace}</span>
                        </div>
                    )}
                </div>

                {student.address && (
                    <div>
                        <span className="text-gray-500 block text-sm">Adresse</span>
                        <span className="font-medium text-gray-800 text-sm">{student.address}</span>
                    </div>
                )}

                {student.email && (
                    <div>
                        <span className="text-gray-500 block text-sm">Email</span>
                        <span className="font-medium text-gray-800 text-sm break-all">{student.email}</span>
                    </div>
                )}
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
                            size={100}
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