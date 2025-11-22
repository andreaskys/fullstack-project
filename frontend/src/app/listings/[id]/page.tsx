"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"

// Imports UI (Shadcn & Lucide)
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
    ArrowLeft,
    MapPin,
    Users,
    Star,
    Heart,
    Share2,
    CheckCircle2,
    Clock,
    MessageCircle,
    Sparkles,
    Music,
    Utensils,
    Wifi,
    Car,
    Camera,
    PartyPopper,
    Loader2
} from "lucide-react"

// Tipos e Componentes Lógicos
import { ListingCard } from "../../../../types" // Ajuste o caminho conforme sua estrutura
import ListingActions from "@/components/ListingActions"

// Mapeamento de ícones para bater com o design do v0
const amenityIcons: Record<string, any> = {
    "Professional sound system": Music,
    "Som": Music,
    "Elegant lighting": Sparkles,
    "Iluminação": Sparkles,
    "Catering kitchen": Utensils,
    "Cozinha": Utensils,
    "Free parking": Car,
    "Estacionamento": Car,
    "WiFi included": Wifi,
    "Wi-Fi": Wifi,
    "Professional photography spots": Camera,
    "Climate controlled": Clock,
    "Ar Condicionado": Clock,
    "Wheelchair accessible": CheckCircle2,
    "Acessibilidade": CheckCircle2,
}

export default function ListingDetailPage() {
    const params = useParams()
    const id = params.id as string
    const router = useRouter()

    // --- ESTADOS ---
    const [listing, setListing] = useState<ListingCard | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Estados Visuais
    const [selectedImageIndex, setSelectedImageIndex] = useState(0)
    const [isFavorite, setIsFavorite] = useState(false)

    // --- FETCH DATA ---
    useEffect(() => {
        const fetchListing = async () => {
            if (!id) return
            setIsLoading(true)
            try {
                const res = await fetch(`/api/listings/${id}`)
                if (!res.ok) {
                    if (res.status === 404) throw new Error("Espaço não encontrado")
                    throw new Error("Falha ao carregar dados")
                }
                const data = await res.json()
                setListing(data)
            } catch (err: any) {
                setError(err.message)
            } finally {
                setIsLoading(false)
            }
        }
        fetchListing()
    }, [id])

    // --- LOADING STATE ---
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background via-accent/10 to-background">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <p className="text-muted-foreground animate-pulse">Carregando detalhes do espaço...</p>
                </div>
            </div>
        )
    }

    // --- ERROR STATE ---
    if (error || !listing) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-background via-accent/10 to-background p-4">
                <div className="text-center space-y-4">
                    <h1 className="text-2xl font-bold text-red-500">{error || "Espaço não encontrado"}</h1>
                    <Button onClick={() => router.push("/")} variant="outline">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para a Home
                    </Button>
                </div>
            </div>
        )
    }

    // Preparar imagens (Fallback se estiver vazio)
    const images = listing.imageUrls && listing.imageUrls.length > 0
        ? listing.imageUrls
        : ["/placeholder.svg"]

    return (
        <div className="min-h-screen bg-gradient-to-b from-background via-accent/10 to-background">
            {/* Botão Voltar */}
            <div className="container max-w-7xl mx-auto px-4 pt-24 pb-6">
                <Link href="/">
                    <Button variant="ghost" className="group hover:bg-primary/10 transition-all duration-200">
                        <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                        Voltar para a Lista
                    </Button>
                </Link>
            </div>

            <div className="container max-w-7xl mx-auto px-4 pb-16">
                <div className="grid lg:grid-cols-3 gap-8">

                    {/* --- COLUNA DA ESQUERDA (Detalhes) --- */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Galeria de Imagens */}
                        <div className="space-y-4 animate-fade-in-up">
                            {/* Imagem Principal */}
                            <div className="relative aspect-[16/10] rounded-2xl overflow-hidden group shadow-lg border border-gray-100">
                                <Image
                                    src={images[selectedImageIndex]}
                                    alt={listing.title}
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                                    priority
                                    unoptimized // Importante para uploads locais
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                {/* Botões de Ação (Like/Share) */}
                                <div className="absolute top-4 right-4 flex gap-2">
                                    <Button
                                        size="icon"
                                        variant="secondary"
                                        className="rounded-full bg-white/90 hover:bg-white backdrop-blur-sm transition-all duration-200 hover:scale-110 shadow-sm"
                                        onClick={() => setIsFavorite(!isFavorite)}
                                    >
                                        <Heart className={`h-4 w-4 transition-all ${isFavorite ? "fill-red-500 text-red-500" : "text-gray-700"}`} />
                                    </Button>
                                    <Button
                                        size="icon"
                                        variant="secondary"
                                        className="rounded-full bg-white/90 hover:bg-white backdrop-blur-sm transition-all duration-200 hover:scale-110 shadow-sm"
                                    >
                                        <Share2 className="h-4 w-4 text-gray-700" />
                                    </Button>
                                </div>

                                {/* Badge de Categoria */}
                                <Badge className="absolute bottom-4 left-4 bg-primary/90 backdrop-blur-md text-white border-0 text-sm px-4 py-1.5 shadow-lg">
                                    <PartyPopper className="h-3.5 w-3.5 mr-2" />
                                    Espaço de Eventos
                                </Badge>
                            </div>

                            {/* Thumbnails Grid */}
                            {images.length > 1 && (
                                <div className="grid grid-cols-4 gap-3">
                                    {images.map((image, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setSelectedImageIndex(index)}
                                            className={`relative aspect-video rounded-lg overflow-hidden transition-all duration-300 hover:scale-105 border-2 ${
                                                selectedImageIndex === index
                                                    ? "border-primary ring-2 ring-primary/20 shadow-md"
                                                    : "border-transparent opacity-70 hover:opacity-100"
                                            }`}
                                        >
                                            <Image src={image} alt={`View ${index + 1}`} fill className="object-cover" unoptimized />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Card de Informações Principais */}
                        <Card className="border-2 border-gray-100 shadow-sm animate-scale-in">
                            <CardContent className="p-6 md:p-8 space-y-6">
                                {/* Título e Rating */}
                                <div className="space-y-3">
                                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">{listing.title}</h1>

                                        {listing.rating && (
                                            <div className="flex items-center gap-2 bg-amber-50 px-4 py-2 rounded-full shrink-0 border border-amber-100 self-start">
                                                <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                                                <span className="font-bold text-lg text-gray-900">{listing.rating}</span>
                                                <span className="text-sm text-gray-500">(127 reviews)</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <MapPin className="h-5 w-5 text-primary shrink-0" />
                                        <span className="text-lg">{listing.location || "Localização não informada"}</span>
                                    </div>

                                    <div className="flex items-center gap-6 pt-2">
                                        <div className="flex items-center gap-2 text-muted-foreground bg-accent/30 px-3 py-1.5 rounded-md">
                                            <Users className="h-5 w-5 text-primary" />
                                            <span>
                        Até <span className="font-semibold text-foreground">{listing.maxGuests} convidados</span>
                      </span>
                                        </div>
                                    </div>
                                </div>

                                <Separator />

                                {/* Descrição */}
                                <div className="space-y-3">
                                    <h2 className="text-2xl font-semibold tracking-tight">Sobre este espaço</h2>
                                    <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                                        {listing.description}
                                    </p>
                                </div>

                                <Separator />

                                {/* Comodidades (Amenities) */}
                                {listing.amenities && listing.amenities.length > 0 && (
                                    <div className="space-y-4">
                                        <h2 className="text-2xl font-semibold tracking-tight">O que este lugar oferece</h2>
                                        <div className="grid sm:grid-cols-2 gap-3">
                                            {listing.amenities.map((amenity, index) => {
                                                const Icon = amenityIcons[amenity] || CheckCircle2
                                                return (
                                                    <div
                                                        key={index}
                                                        className="flex items-center gap-3 p-3 rounded-lg bg-accent/30 hover:bg-accent/50 transition-colors duration-200"
                                                    >
                                                        <Icon className="h-5 w-5 text-primary shrink-0" />
                                                        <span className="text-sm font-medium">{amenity}</span>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Card do Anfitrião */}
                        <Card className="border-2 border-gray-100 shadow-sm animate-scale-in">
                            <CardContent className="p-6 md:p-8">
                                <h2 className="text-2xl font-semibold mb-6">Conheça seu anfitrião</h2>
                                <div className="flex items-start gap-6">
                                    <div className="relative h-20 w-20 rounded-full overflow-hidden ring-4 ring-primary/10 shrink-0 bg-gray-100 flex items-center justify-center">
                                        {listing.hostName ? (
                                            // Se tiver avatar no futuro, use Image. Por enquanto, iniciais.
                                            <span className="text-2xl font-bold text-primary">{listing.hostName.charAt(0)}</span>
                                        ) : (
                                            <Users className="h-8 w-8 text-gray-400" />
                                        )}
                                    </div>

                                    <div className="space-y-3 flex-1">
                                        <div>
                                            <h3 className="text-xl font-bold">{listing.hostName || "Anfitrião"}</h3>
                                            <p className="text-sm text-muted-foreground">Membro desde 2022</p>
                                        </div>

                                        <div className="grid sm:grid-cols-2 gap-3 text-sm">
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                                                <span>Identidade verificada</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <Clock className="h-4 w-4 text-primary" />
                                                <span>Responde rápido</span>
                                            </div>
                                        </div>

                                        <Button variant="outline" className="mt-2 bg-transparent hover:bg-primary/5">
                                            <MessageCircle className="h-4 w-4 mr-2" />
                                            Contatar Anfitrião
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="lg:col-span-1">
                        <div className="sticky top-24 animate-slide-in-right">
                            <ListingActions
                                hostId={listing.hostId}
                                listingId={listing.id}
                                price={listing.price}
                                maxGuests={listing.maxGuests}
                                rating={listing.rating}
                            />
                            <p className="text-xs text-center text-muted-foreground mt-4">
                                <span className="font-semibold">Garantia PartyPlace</span>: Seu dinheiro está seguro até o evento acontecer.
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}