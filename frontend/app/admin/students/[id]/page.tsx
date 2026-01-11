'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    ArrowLeft,
    User,
    Mail,
    Phone,
    Calendar,
    MapPin,
    BookOpen,
    Users,
    CreditCard,
    Key,
    Edit,
    Save,
    X
} from 'lucide-react';
import { getStudentById, updateStudent, getStudentLoginInfo, updateStudentPassword } from '@/lib/services/students';

export default function StudentDetailPage() {
    const params = useParams();
    const router = useRouter();
    const studentId = params.id as string;

    const [student, setStudent] = useState<any>(null);
    const [loginInfo, setLoginInfo] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [isEditingPassword, setIsEditingPassword] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [formData, setFormData] = useState<any>({});

    useEffect(() => {
        if (studentId) {
            fetchStudentData();
        }
    }, [studentId]);

    const fetchStudentData = async () => {
        setIsLoading(true);
        try {
            const studentData = await getStudentById(studentId);
            const loginData = await getStudentLoginInfo(studentId);
            setStudent(studentData);
            setLoginInfo(loginData);
            setFormData(studentData);
        } catch (error) {
            console.error('Error fetching student data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateStudent = async () => {
        try {
            await updateStudent(studentId, formData);
            setStudent(formData);
            setIsEditing(false);
        } catch (error) {
            console.error('Error updating student:', error);
        }
    };

    const handleUpdatePassword = async () => {
        if (!newPassword) return;

        try {
            await updateStudentPassword(studentId, newPassword);
            setNewPassword('');
            setIsEditingPassword(false);
            alert('Password updated successfully');
        } catch (error) {
            console.error('Error updating password:', error);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!student) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Student Not Found</h2>
                    <button
                        onClick={() => router.back()}
                        className="text-blue-600 hover:text-blue-800"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => router.back()}
                                className="p-2 rounded-lg hover:bg-gray-100"
                            >
                                <ArrowLeft className="h-5 w-5" />
                            </button>
                            <div>
                                <h1 className="text-xl font-semibold text-gray-900">
                                    {student.name} {student.surname}
                                </h1>
                                <p className="text-sm text-gray-500">Student Details</p>
                            </div>
                        </div>
                        <div className="flex space-x-2">
                            {!isEditing ? (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                                >
                                    <Edit className="h-4 w-4" />
                                    <span>Edit</span>
                                </button>
                            ) : (
                                <div className="flex space-x-2">
                                    <button
                                        onClick={handleUpdateStudent}
                                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
                                    >
                                        <Save className="h-4 w-4" />
                                        <span>Save</span>
                                    </button>
                                    <button
                                        onClick={() => {
                                            setIsEditing(false);
                                            setFormData(student);
                                        }}
                                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center space-x-2"
                                    >
                                        <X className="h-4 w-4" />
                                        <span>Cancel</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Info */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Personal Information */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                <User className="h-5 w-5 mr-2" />
                                Personal Information
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Name</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={formData.name || ''}
                                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        />
                                    ) : (
                                        <p className="mt-1 text-sm text-gray-900">{student.name}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Surname</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={formData.surname || ''}
                                            onChange={(e) => setFormData({...formData, surname: e.target.value})}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        />
                                    ) : (
                                        <p className="mt-1 text-sm text-gray-900">{student.surname}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 flex items-center">
                                        <Mail className="h-4 w-4 mr-1" />
                                        Email
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="email"
                                            value={formData.email || ''}
                                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        />
                                    ) : (
                                        <p className="mt-1 text-sm text-gray-900">{student.email || 'Not set'}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 flex items-center">
                                        <Phone className="h-4 w-4 mr-1" />
                                        Phone
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={formData.phone || ''}
                                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        />
                                    ) : (
                                        <p className="mt-1 text-sm text-gray-900">{student.phone || 'Not set'}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Login Information */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                <Key className="h-5 w-5 mr-2" />
                                Login Information
                            </h2>
                            {loginInfo && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Email</label>
                                        <p className="mt-1 text-sm text-gray-900">{loginInfo.email}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Password</label>
                                        <div className="flex items-center space-x-2">
                                            <span className="text-sm text-gray-500">••••••••</span>
                                            {!isEditingPassword ? (
                                                <button
                                                    onClick={() => setIsEditingPassword(true)}
                                                    className="text-blue-600 hover:text-blue-800 text-sm"
                                                >
                                                    Change Password
                                                </button>
                                            ) : (
                                                <div className="flex items-center space-x-2">
                                                    <input
                                                        type="password"
                                                        value={newPassword}
                                                        onChange={(e) => setNewPassword(e.target.value)}
                                                        placeholder="New password"
                                                        className="px-3 py-1 border rounded text-sm"
                                                    />
                                                    <button
                                                        onClick={handleUpdatePassword}
                                                        className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                                                    >
                                                        Save
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setIsEditingPassword(false);
                                                            setNewPassword('');
                                                        }}
                                                        className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Academic Info */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                <BookOpen className="h-5 w-5 mr-2" />
                                Academic Information
                            </h2>
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">School Level</label>
                                    <p className="mt-1 text-sm text-gray-900">{student.schoolLevel || 'Not set'}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Current School</label>
                                    <p className="mt-1 text-sm text-gray-900">{student.currentSchool || 'Not set'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Status */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Status</h2>
                            <div className="flex items-center">
                                <div className={`w-3 h-3 rounded-full mr-2 ${student.active ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                <span className="text-sm text-gray-900">{student.active ? 'Active' : 'Inactive'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}