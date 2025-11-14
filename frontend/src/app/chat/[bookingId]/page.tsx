'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { use, useEffect, useState } from 'react';
import ChatBox from '@/components/ChatBox';
import Link from "next/link";

type ChatPageProps = {
    params: Promise<{
        bookingId: string;
    }>;
};

export default function ChatPage({ params }: ChatPageProps) {
    const { isAuthenticated } = useAuth();
    const router = useRouter();

    const resolvedParams = use(params);
    const [bookingId, setBookingId] = useState<string | null>(null);

    useEffect(() => {
        setBookingId(resolvedParams.bookingId);
    }, [resolvedParams.bookingId]);

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
        }
    }, [isAuthenticated, router]);

    if (!isAuthenticated || !bookingId) {
        return <main className="p-8">A carregar...</main>;
    }

    return (
        <main className="p-8 bg-gray-100 min-h-screen text-gray-900">
            <div className="max-w-3xl mx-auto">
                <Link href="/my-bookings" className="text-blue-500 hover:underline">
                    &larr; Voltar para Minhas Reservas
                </Link>
                <h1 className="text-3xl font-bold my-4">Chat da Reserva #{bookingId}</h1>

                <ChatBox roomId={bookingId} />
            </div>
        </main>
    );
}