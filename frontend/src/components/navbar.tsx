'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {MapPin, Menu, X, Home, List, Calendar, MessageSquare, Plus, LogOut} from 'lucide-react'
import { useState } from 'react'
import {useAuth} from "@/context/AuthContext";
import {useNotifications} from "@/hooks/useNotification";
import {useRouter} from "next/navigation";

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const {isAuthenticated, logout} = useAuth();
    const { notifications, unreadCount, isConnected, markAsRead, clearNotifications } = useNotifications();
    const router = useRouter();

    const handleLogout = () => {
        logout();
        setIsMenuOpen(false)
        router.push('/');
    }

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto px-4">
                <div className="flex h-16 items-center justify-between">
                    {/* Logo */}
                    <Link
                        href="/"
                        className="flex items-center gap-2 group transition-all duration-300"
                    >
                        <div className="relative">
                            <MapPin className="h-7 w-7 text-primary transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12" />
                            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full scale-0 group-hover:scale-150 transition-transform duration-500" />
                        </div>
                        <span className="text-xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              PartyPlace
            </span>

                    </Link>
                    <div className="hidden md:flex items-center gap-6">
                        <Link
                            href="/"
                            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200"
                        >
                            <Home className="h-4 w-4" />
                            Descubra Espaços
                        </Link>
                        {isAuthenticated && (
                            <>
                                <Link
                                    href="/my-listings"
                                    className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200"
                                >
                                    <List className="h-4 w-4" />
                                    Meus espaços
                                </Link>
                                <Link
                                    href="/my-bookings"
                                    className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200"
                                >
                                    <Calendar className="h-4 w-4" />
                                    Minhas Reservas
                                </Link>
                                <Link
                                    href="/chat"
                                    className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200"
                                >
                                    <MessageSquare className="h-4 w-4" />
                                    Mensagens
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Desktop Auth Buttons */}
                    <div className="hidden md:flex items-center gap-3">
                        {isAuthenticated ? (
                            <>
                                <Button
                                    size="sm"
                                    asChild
                                    className="transition-all duration-200 hover:scale-105 hover:shadow-lg"
                                >
                                    <Link href="/create-listing" className="flex items-center gap-2">
                                        <Plus className="h-4 w-4" />
                                        Anuncie seu Espaço
                                    </Link>
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleLogout}
                                    className="transition-all duration-200 hover:scale-105 flex items-center gap-2"
                                >
                                    <LogOut className="h-4 w-4" />
                                    Logout
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    asChild
                                    className="transition-all duration-200 hover:scale-105"
                                >
                                    <Link href="/login">Login</Link>
                                </Button>
                                <Button
                                    size="sm"
                                    asChild
                                    className="transition-all duration-200 hover:scale-105 hover:shadow-lg bg-gradient-to-r from-primary to-secondary"
                                >
                                    <Link href="/register">Registrar</Link>
                                </Button>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
                        aria-label="Toggle menu"
                    >
                        {isMenuOpen ? (
                            <X className="h-6 w-6" />
                        ) : (
                            <Menu className="h-6 w-6" />
                        )}
                    </button>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="md:hidden py-4 animate-fade-in-up">
                        <div className="flex flex-col gap-3">
                            <Link
                                href="/"
                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                <Home className="h-4 w-4" />
                                Descubra Espaços
                            </Link>
                            {isAuthenticated && (
                                <>
                                    <Link
                                        href="/my-listings"
                                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        <List className="h-4 w-4" />
                                        Meu espaços
                                    </Link>
                                    <Link
                                        href="/my-bookings"
                                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        <Calendar className="h-4 w-4" />
                                        Minhas Reservas
                                    </Link>
                                    <Link
                                        href="/chat"
                                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        <MessageSquare className="h-4 w-4" />
                                        Mensagens
                                    </Link>
                                </>
                            )}
                            <div className="h-px bg-border my-2" />
                            {isAuthenticated ? (
                                <>
                                    <Button
                                        size="sm"
                                        asChild
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        <Link href="/create-listing" className="flex items-center gap-2">
                                            <Plus className="h-4 w-4" />
                                            Anuncie seu Espaço
                                        </Link>
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleLogout}
                                        className="justify-start flex items-center gap-2"
                                    >
                                        <LogOut className="h-4 w-4" />
                                        Logout
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        asChild
                                        className="justify-start"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        <Link href="/login">Login</Link>
                                    </Button>
                                    <Button
                                        size="sm"
                                        asChild
                                        className="justify-start bg-gradient-to-r from-primary to-secondary"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        <Link href="/register">Registrar</Link>
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    )
}