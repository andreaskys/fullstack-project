"use client"

import { useState } from "react"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Calendar, Users, Star, PartyPopper } from "lucide-react"
import { useRouter } from "next/navigation"

interface BookingWidgetProps {
    listingId: number
    price: number
    maxGuests: number
    rating?: number
    reviews?: number
    isAuthenticated: boolean
    isOwner: boolean
}

export default function BookingWidget({
                                          listingId,
                                          price,
                                          maxGuests,
                                          rating = 0,
                                          reviews = 0,
                                          isAuthenticated,
                                          isOwner
                                      }: BookingWidgetProps) {
    const { token } = useAuth()
    const router = useRouter()
    const [guests, setGuests] = useState(Math.min(50, maxGuests))
    const [date, setDate] = useState("")
    const [eventType, setEventType] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    // Cálculos de preço
    const serviceFee = Math.round(price * 0.1) // 10% de taxa
    const total = price + serviceFee

    const handleBooking = async (e: React.FormEvent) => {
        e.preventDefault()

        if (isOwner) {
            alert("Você é o dono deste espaço!")
            return
        }

        if (!isAuthenticated) {
            router.push(`/login?redirect=/listings/${listingId}`)
            return
        }

        if (!date) {
            alert("Por favor, selecione uma data para o evento.")
            return
        }

        setIsLoading(true)

        const checkOutObj = new Date(date)
        checkOutObj.setUTCDate(checkOutObj.getUTCDate() + 1)
        const checkOutDate = checkOutObj.toISOString().split('T')[0]

        try {
            const res = await fetch("/api/bookings", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    listingId,
                    checkInDate: date,
                    checkOutDate: checkOutDate,
                    numberOfGuests: guests,
                    totalPrice: total
                })
            })

            if (!res.ok) {
                const data = await res.json().catch(() => null)
                throw new Error(data?.message || "Falha ao criar reserva")
            }

            alert("Reserva solicitada com sucesso!")
            router.push("/my-bookings")
        } catch (error: any) {
            console.error("Erro na reserva:", error)
            alert(error.message || "Ocorreu um erro ao tentar realizar a reserva. Tente novamente.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Card className="border-2 shadow-2xl animate-slide-in-right bg-white">
            <CardContent className="p-6 space-y-6">

                {/* Cabeçalho com Preço e Rating */}
                <div className="space-y-2">
                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-bold text-primary">R$ {price}</span>
                        <span className="text-muted-foreground">/evento</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        {rating > 0 && (
                            <>
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                <span className="font-semibold text-foreground">{rating}</span>
                                <span>·</span>
                            </>
                        )}
                        <span>{reviews > 0 ? `${reviews} avaliações` : "Sem avaliações"}</span>
                    </div>
                </div>

                <Separator />

                {/* Formulário */}
                <form onSubmit={handleBooking} className="space-y-4">

                    {/* Data */}
                    <div className="space-y-2">
                        <Label htmlFor="eventDate" className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-primary" />
                            Data do Evento
                        </Label>
                        <Input
                            id="eventDate"
                            type="date"
                            required
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="border-2 focus:border-primary transition-colors"
                        />
                    </div>

                    {/* Tipo de Evento */}
                    <div className="space-y-2">
                        <Label htmlFor="eventType" className="flex items-center gap-2">
                            <PartyPopper className="h-4 w-4 text-primary" />
                            Tipo de Evento
                        </Label>
                        <Input
                            id="eventType"
                            placeholder="Ex: Casamento, Aniversário..."
                            required
                            value={eventType}
                            onChange={(e) => setEventType(e.target.value)}
                            className="border-2 focus:border-primary transition-colors"
                        />
                    </div>

                    {/* Slider de Convidados */}
                    <div className="space-y-2">
                        <Label htmlFor="guests" className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                Número de Convidados
              </span>
                            <span className="font-semibold text-primary">{guests}</span>
                        </Label>
                        <input
                            id="guests"
                            type="range"
                            min="1"
                            max={maxGuests}
                            value={guests}
                            onChange={(e) => setGuests(Number(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                            <span>1</span>
                            <span>{maxGuests}</span>
                        </div>
                    </div>

                    {/* Botão de Ação */}
                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-primary to-blue-600 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] text-lg py-6 text-white font-bold"
                    >
                        {isLoading ? "Processando..." : (isAuthenticated ? "Solicitar Reserva" : "Faça Login para Reservar")}
                    </Button>

                    {!isAuthenticated && (
                        <p className="text-xs text-center text-muted-foreground">
                            Você será redirecionado para o login.
                        </p>
                    )}
                    {isAuthenticated && (
                        <p className="text-xs text-center text-muted-foreground">
                            Você não será cobrado ainda.
                        </p>
                    )}
                </form>

                <Separator />

                {/* Resumo de Preços */}
                <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Preço base</span>
                        <span className="font-medium">R$ {price}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Taxa de serviço</span>
                        <span className="font-medium">R$ {serviceFee}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-lg font-bold">
                        <span>Total</span>
                        <span className="text-primary">R$ {total}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}