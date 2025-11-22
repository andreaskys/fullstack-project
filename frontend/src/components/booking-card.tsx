'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MapPin, Calendar, Users, MessageSquare, X } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface Booking {
    id: string
    listing: {
        id: string
        name: string
        coverImage: string
        location: string
    }
    eventDate: string
    guests: number
    totalPrice: number
    status: 'upcoming' | 'completed' | 'cancelled'
    bookingDate: string
    hostName: string
}

interface BookingCardProps {
    booking: Booking
    onCancel?: (id: string) => void
}

export function BookingCard({ booking, onCancel }: BookingCardProps) {
    const statusColors = {
        upcoming: 'bg-blue-500/90 text-white',
        completed: 'bg-green-500/90 text-white',
        cancelled: 'bg-gray-500/90 text-white'
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        })
    }

    return (
        <Card className="overflow-hidden border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-xl animate-scale-in">
            <div className="flex flex-col md:flex-row">
                {/* Image Section */}
                <div className="relative w-full md:w-48 h-48 md:h-auto">
                    <Image
                        src={booking.listing.coverImage || "/placeholder.svg"}
                        alt={booking.listing.name}
                        fill
                        className="object-cover"
                    />
                    <Badge className={`absolute top-3 right-3 ${statusColors[booking.status]} border-0`}>
                        {booking.status}
                    </Badge>
                </div>

                {/* Content Section */}
                <CardContent className="flex-1 p-6">
                    <div className="flex flex-col md:flex-row justify-between gap-4 h-full">
                        <div className="space-y-3 flex-1">
                            <div>
                                <Link
                                    href={`/listing/${booking.listing.id}`}
                                    className="text-xl font-semibold hover:text-primary transition-colors line-clamp-1"
                                >
                                    {booking.listing.name}
                                </Link>
                                <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                                    <MapPin className="h-4 w-4 text-primary" />
                                    <span>{booking.listing.location}</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm">
                                    <Calendar className="h-4 w-4 text-primary" />
                                    <span className="font-medium">Event Date:</span>
                                    <span className="text-muted-foreground">{formatDate(booking.eventDate)}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <Users className="h-4 w-4 text-primary" />
                                    <span className="font-medium">Guests:</span>
                                    <span className="text-muted-foreground">{booking.guests}</span>
                                </div>
                            </div>

                            <div className="pt-2 border-t">
                                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-primary">
                    ${booking.totalPrice.toLocaleString()}
                  </span>
                                    <span className="text-sm text-muted-foreground">total</span>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Booked on {formatDate(booking.bookingDate)}
                                </p>
                            </div>
                        </div>

                        {/* Actions Section */}
                        <div className="flex md:flex-col gap-2 justify-end">
                            <Button
                                variant="outline"
                                size="sm"
                                asChild
                                className="flex-1 md:flex-initial"
                            >
                                <Link href={`/chat?booking=${booking.id}`} className="flex items-center gap-2">
                                    <MessageSquare className="h-4 w-4" />
                                    Contact Host
                                </Link>
                            </Button>

                            {booking.status === 'upcoming' && onCancel && (
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            className="flex-1 md:flex-initial"
                                        >
                                            <X className="h-4 w-4 mr-2" />
                                            Cancel
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Cancel Booking</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Are you sure you want to cancel this booking for {booking.listing.name}?
                                                This action cannot be undone.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Keep Booking</AlertDialogCancel>
                                            <AlertDialogAction
                                                onClick={() => onCancel(booking.id)}
                                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                            >
                                                Cancel Booking
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            )}
                        </div>
                    </div>
                </CardContent>
            </div>
        </Card>
    )
}