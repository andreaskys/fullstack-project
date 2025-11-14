'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
    const { isAuthenticated, logout } = useAuth();

    return (
        <nav className="w-full bg-white shadow-md">
            <div className="container mx-auto px-6 py-4 flex justify-between items-center">

                <Link href="/" className="text-2xl font-bold text-blue-600">
                    PartyLocator
                </Link>

                <div className="flex items-center space-x-4">

                    {isAuthenticated ? (
                        <>
                            <Link href="/create-listing" className="font-semibold text-blue-600 hover:text-blue-800">
                                Criar Espaço
                            </Link>
                            <Link href="/my-listings" className="text-gray-700 hover:text-blue-600">
                                Meus Espaços
                            </Link>
                            <Link href="/my-bookings" className="text-black hover:text-blue-600">
                                Minhas Reservas
                            </Link>
                            <button
                                onClick={logout}
                                className="px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700"
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link href="/login" className="text-gray-700 hover:text-blue-600">
                                Login
                            </Link>
                            <Link
                                href="/register"
                                className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
                            >
                                Registar
                            </Link>
                        </>

                    )}
                </div>
            </div>
        </nav>
    );
}