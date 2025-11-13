import Image from 'next/image';
import {ListingCard} from "../../../../types";
import ListingActions from "@/components/ListingActions";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

export default async function ListingDetailPage({ params }: { params: Promise<{ id: string }> }) {

    const { id } = await params;

    let listing: ListingCard | null = null;
    let error: string | null = null;


    try {
        const res = await fetch(`${API_BASE_URL}/api/listings/${id}`, {
            cache: 'no-store'
        });

        if (!res.ok) {
            if (res.status === 404) {
            } else {
                error = `Falha ao buscar listing: ${res.statusText}`;
            }
        } else {
            listing = await res.json();
        }

    } catch (e: any) {
        console.error("Erro de rede ou conexão:", e);
        error = "Erro de conexão com o servidor. O backend está a correr?";
    }

    if (error) {
        return (
            <main className="p-8 min-h-screen">
                <h1 className="text-4xl font-bold text-red-600">Erro no Servidor</h1>
                <p className="mt-4 text-gray-300">{error}</p>
                <a href="/" className="text-blue-500 hover:underline mt-4 inline-block">
                    Voltar para a Home
                </a>
            </main>
        );
    }

    if (!listing) {
        return (
            <main className="p-8 min-h-screen">
                <h1 className="text-4xl font-bold">Listing Não Encontrado</h1>
                <p className="mt-4">O espaço com ID "{id}" não existe.</p>
                <a href="/" className="text-blue-500 hover:underline mt-4 inline-block">
                    Voltar para a Home
                </a>
            </main>
        );
    }

    const mainImage = listing.imageUrls?.[0] || null;
    const otherImages = listing.imageUrls?.slice(1) || [];

    return (
        <main className="p-8 bg-gray-50 min-h-screen">
            <div className="max-w-4xl mx-auto">

                <div className="w-full">
                    {mainImage ? (
                        <div className="h-96 w-full relative rounded-lg overflow-hidden mb-4">
                            <Image
                                src={mainImage}
                                alt={listing.title}
                                fill
                                style={{ objectFit: 'cover' }}
                                priority
                            />
                        </div>
                    ) : (
                        <div className="h-96 w-full bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                            <span className="text-gray-500">Sem Imagem Principal</span>
                        </div>
                    )}

                    {otherImages.length > 0 && (
                        <div className="grid grid-cols-5 gap-2">
                            {otherImages.map((url, index) => (
                                <div key={index} className="h-24 w-full relative rounded-md overflow-hidden">
                                    <Image
                                        src={url}
                                        alt={`${listing.title} imagem ${index + 2}`}
                                        fill
                                        style={{ objectFit: 'cover' }}
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <ListingActions
                    hostId={listing.hostId}
                    listingId={listing.id}
                    price={listing.price}
                />

                <h1 className="text-4xl font-bold mb-4 mt-8">{listing.title}</h1>
                <p className="text-xl text-gray-700 mb-4">{listing.location}</p>

                <div className="border-y border-gray-300 py-6 my-6">
                    <p className="text-lg">
                        Anfitrião: <span className="font-semibold">{listing.hostName}</span>
                    </p>
                    <p className="text-lg">
                        Acomoda: <span className="font-semibold">{listing.maxGuests} pessoas</span>
                    </p>
                </div>
                <p className="text-gray-800 text-lg mb-6">
                    {listing.description}
                </p>
                {listing.amenities && listing.amenities.length > 0 && (
                    <div className="border-t border-gray-300 py-6 my-6">
                        <h2 className="text-2xl font-semibold mb-4">O que este espaço oferece</h2>
                        <ul className="grid grid-cols-2 gap-4">
                            {listing.amenities.map((amenity) => (
                                <li key={amenity} className="text-lg text-gray-700">
                                    ✓ {amenity}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                {listing.videoUrls && listing.videoUrls.length > 0 && (
                    <div className="border-t border-gray-300 py-6 my-6">
                        <h2 className="text-2xl font-semibold mb-4">Vídeos do Espaço</h2>
                        {listing.videoUrls.map((videoUrl, index) => (
                            <video
                                key={index}
                                src={videoUrl}
                                controls
                                className="w-full rounded-lg shadow-md mb-4"
                            >
                                O seu navegador não suporta a tag de vídeo.
                            </video>
                        ))}
                    </div>
                )}
                <div className="text-3xl font-bold text-gray-900">
                    R$ {listing.price}
                    <span className="text-xl font-normal text-gray-500"> / noite</span>
                </div>
            </div>
        </main>
    );
}