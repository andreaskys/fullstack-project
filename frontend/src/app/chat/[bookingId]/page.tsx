'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { use, useEffect, useState } from 'react';
import Link from "next/link";

import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, ArrowLeft, Phone, Video, MoreVertical } from 'lucide-react';

import ChatBox from '@/components/ChatBox';

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
        return (
            <div className="h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/20">
                <p className="animate-pulse">A carregar chat...</p>
            </div>
        );
    }
    return (
        <div className="h-[calc(100vh-4rem)] bg-gradient-to-b from-background to-muted/20 p-4 md:p-6">
            <div className="container mx-auto h-full max-w-6xl">
                <div className="mb-4 flex items-center gap-2">
                    <Link href="/my-bookings">
                        <Button variant="ghost" size="sm" className="gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            Voltar para Minhas Reservas
                        </Button>
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-full max-h-[800px]">
                    <Card className="hidden lg:col-span-4 lg:flex flex-col border-2 overflow-hidden">
                        <CardHeader className="border-b bg-muted/30 p-4">
                            <h2 className="text-xl font-bold mb-3">Mensagens</h2>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input placeholder="Procurar..." className="pl-9" />
                            </div>
                        </CardHeader>
                        <ScrollArea className="flex-1">
                            <div className="p-4 text-sm text-muted-foreground text-center">
                                Outras conversas apareceriam aqui.
                            </div>
                        </ScrollArea>
                    </Card>
                    <Card className="col-span-1 lg:col-span-8 border-2 overflow-hidden flex flex-col shadow-lg animate-fade-in-up">
                        <CardHeader className="border-b bg-muted/30 p-4 shrink-0">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-10 w-10 border-2 border-background">
                                        <AvatarImage src="/placeholder.svg" />
                                        <AvatarFallback>R#{bookingId?.slice(0,2)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <h3 className="font-semibold">Reserva #{bookingId}</h3>
                                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                                            <span className="block w-2 h-2 bg-green-500 rounded-full" />
                                            Online agora
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Button size="icon" variant="ghost"><Phone className="h-5 w-5" /></Button>
                                    <Button size="icon" variant="ghost"><Video className="h-5 w-5" /></Button>
                                    <Button size="icon" variant="ghost"><MoreVertical className="h-5 w-5" /></Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0 flex-1 flex flex-col overflow-hidden bg-background/50 backdrop-blur-sm">
                            <div className="h-full w-full flex flex-col">
                                <ChatBox roomId={bookingId} />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}