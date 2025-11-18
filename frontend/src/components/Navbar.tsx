'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useState, useRef, useEffect } from 'react';
import {useNotifications} from "@/hooks/useNotification";
import { useRouter } from 'next/navigation';

const BellIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341A6.002 6.002 0 006 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
        />
    </svg>
);

export default function Navbar() {
    const { isAuthenticated, logout } = useAuth();
    const { notifications, unreadCount, isConnected, markAsRead, clearNotifications } = useNotifications();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleBellClick = () => {
        if (!isDropdownOpen) {
            markAsRead();
        }
        setIsDropdownOpen(!isDropdownOpen);
    };

    const handleNotificationClick = (link: string) => {
        router.push(link);
        setIsDropdownOpen(false);
    };

    const handleClearAll = () => {
        clearNotifications();
        setIsDropdownOpen(false);
    };

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
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    onClick={handleBellClick}
                                    className="relative text-gray-600 hover:text-blue-600 focus:outline-none transition-colors"
                                    aria-label="Notificações"
                                >
                                    <BellIcon />
                                    {unreadCount > 0 && (
                                        <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white animate-pulse">
                                            {unreadCount > 9 ? '9+' : unreadCount}
                                        </span>
                                    )}
                                    {!isConnected && (
                                        <span
                                            className="absolute bottom-0 right-0 block h-2 w-2 rounded-full bg-yellow-500 ring-2 ring-white"
                                            title="Reconectando..."
                                        />
                                    )}
                                </button>
                                {isDropdownOpen && (
                                    <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                                        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
                                            <h3 className="text-sm font-semibold text-gray-900">Notificações</h3>
                                            {notifications.length > 0 && (
                                                <button
                                                    onClick={handleClearAll}
                                                    className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                                                >
                                                    Limpar tudo
                                                </button>
                                            )}
                                        </div>
                                        {notifications.length === 0 ? (
                                            <div className="px-4 py-8 text-center">
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="h-12 w-12 mx-auto mb-2 text-gray-300"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                                                    />
                                                </svg>
                                                <p className="text-sm text-gray-500">Nenhuma notificação nova.</p>
                                            </div>
                                        ) : (
                                            <ul className="divide-y divide-gray-100">
                                                {notifications.map((notif, index) => (
                                                    <li key={index}>
                                                        <button
                                                            onClick={() => handleNotificationClick(notif.link)}
                                                            className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors focus:outline-none focus:bg-gray-50"
                                                        >
                                                            <p className="text-sm text-gray-800 font-medium">
                                                                {notif.message}
                                                            </p>
                                                            <p className="text-xs text-gray-500 mt-1">
                                                                {new Date(notif.timestamp).toLocaleString('pt-PT', {
                                                                    day: '2-digit',
                                                                    month: '2-digit',
                                                                    year: 'numeric',
                                                                    hour: '2-digit',
                                                                    minute: '2-digit'
                                                                })}
                                                            </p>
                                                        </button>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={logout}
                                className="px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
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