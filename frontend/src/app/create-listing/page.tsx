'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { AmenityDTO, ListingCard } from "../../../types";
import ImageUpload from '@/components/ImageUpload';
import VideoUpload from '@/components/VideoUpload';
import Image from "next/image";
import { Sparkles, MapPin, DollarSign, Users, Image as ImageIcon, Video, CheckCircle, X } from 'lucide-react';

export default function CreateListingPage() {
    const { token, isAuthenticated, logout } = useAuth();
    const router = useRouter();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [price, setPrice] = useState(0);
    const [maxGuests, setMaxGuests] = useState(1);

    const [imageUrls, setImageUrls] = useState<string[]>([]);
    const [videoUrls, setVideoUrls] = useState<string[]>([]);

    const [allAmenities, setAllAmenities] = useState<AmenityDTO[]>([]);
    const [selectedAmenities, setSelectedAmenities] = useState<Set<number>>(new Set());

    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
            return;
        }

        const fetchAmenities = async () => {
            try {
                const res = await fetch('/api/amenities');
                if (!res.ok) throw new Error('Falha ao buscar comodidades');
                const data: AmenityDTO[] = await res.json();
                setAllAmenities(data);
            } catch (err: any) {
                setError('Não foi possível carregar as comodidades. Tente novamente.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchAmenities();
    }, [isAuthenticated, router]);

    const handleAmenityChange = (amenityId: number) => {
        setSelectedAmenities((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(amenityId)) {
                newSet.delete(amenityId);
            } else {
                newSet.add(amenityId);
            }
            return newSet;
        });
    };

    const handleImageUploadSuccess = (url: string) => {
        setImageUrls(prevUrls => [...prevUrls, url]);
    };

    const handleVideoUploadSuccess = (url: string) => {
        setVideoUrls(prevUrls => [...prevUrls, url]);
    };

    const removeImage = (urlToRemove: string) => {
        setImageUrls(prevUrls => prevUrls.filter(url => url !== urlToRemove));
    };

    const removeVideo = (urlToRemove: string) => {
        setVideoUrls(prevUrls => prevUrls.filter(url => url !== urlToRemove));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (imageUrls.length === 0) {
            setError("Por favor, faça upload de pelo menos uma imagem de capa.");
            return;
        }

        try {
            const res = await fetch('/api/listings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    title,
                    description,
                    location,
                    price,
                    maxGuests,
                    amenityIds: Array.from(selectedAmenities),
                    imageUrls: imageUrls,
                    videoUrls: videoUrls,
                }),
            });

            if (!res.ok) {
                if (res.status === 403) {
                    logout();
                    return;
                }
                throw new Error('Falha ao criar o anúncio.');
            }

            const newListing: ListingCard = await res.json();
            router.push(`/listings/${newListing.id}`);

        } catch (err: any) {
            setError(err.message);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-gray-50 to-gray-100/20">
                <div className="container mx-auto px-4 py-8">
                    <div className="text-center py-20">
                        <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-blue-600 mb-4"></div>
                        <p className="text-gray-600 text-lg">A carregar...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-gray-50 to-gray-100/20">
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                            <Sparkles className="h-8 w-8 text-blue-600" />
                        </div>
                    </div>
                    <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                        Liste o Seu Espaço
                    </h1>
                    <p className="text-gray-600 text-lg">
                        Compartilhe seu espaço incrível com pessoas procurando o lugar perfeito para celebrar
                    </p>
                </div>

                {/* Form */}
                <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 overflow-hidden">
                    <form onSubmit={handleSubmit} className="p-8 space-y-8">
                        {/* Basic Information */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                    <Sparkles className="h-5 w-5 text-blue-600" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900">Informações Básicas</h2>
                            </div>

                            <div>
                                <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">
                                    Título do Espaço
                                </label>
                                <input
                                    type="text"
                                    id="title"
                                    required
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Ex: Salão de Festas com Piscina"
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 transition-all"
                                />
                            </div>

                            <div>
                                <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
                                    Descrição
                                </label>
                                <textarea
                                    id="description"
                                    rows={5}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Descreva seu espaço, suas características especiais e o que o torna único..."
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 transition-all resize-none"
                                />
                            </div>

                            <div>
                                <label htmlFor="location" className="block text-sm font-semibold text-gray-700 mb-2">
                                    <MapPin className="inline h-4 w-4 mr-1" />
                                    Localização
                                </label>
                                <input
                                    type="text"
                                    id="location"
                                    required
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    placeholder="Ex: São Paulo, SP"
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 transition-all"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="price" className="block text-sm font-semibold text-gray-700 mb-2">
                                        <DollarSign className="inline h-4 w-4 mr-1" />
                                        Preço (por noite)
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">R$</span>
                                        <input
                                            type="number"
                                            id="price"
                                            required
                                            min="0"
                                            value={price}
                                            onChange={(e) => setPrice(Number(e.target.value))}
                                            placeholder="0.00"
                                            className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 transition-all"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="maxGuests" className="block text-sm font-semibold text-gray-700 mb-2">
                                        <Users className="inline h-4 w-4 mr-1" />
                                        Máximo de Hóspedes
                                    </label>
                                    <input
                                        type="number"
                                        id="maxGuests"
                                        required
                                        min="1"
                                        value={maxGuests}
                                        onChange={(e) => setMaxGuests(Number(e.target.value))}
                                        placeholder="1"
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Media Section */}
                        <div className="space-y-6 pt-6 border-t border-gray-200">
                            <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
                                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                                    <ImageIcon className="h-5 w-5 text-purple-600" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900">Mídia do Espaço</h2>
                            </div>

                            {/* Uploaded Images */}
                            {imageUrls.length > 0 && (
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                                        Imagens Carregadas ({imageUrls.length})
                                    </label>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        {imageUrls.map((url, index) => (
                                            <div key={index} className="relative group aspect-square rounded-xl overflow-hidden border-2 border-gray-200">
                                                <Image
                                                    src={url}
                                                    alt={`Preview ${index}`}
                                                    fill
                                                    style={{ objectFit: 'cover' }}
                                                    unoptimized
                                                    className="group-hover:scale-110 transition-transform duration-300"
                                                />
                                                {index === 0 && (
                                                    <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                                                        Capa
                                                    </div>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => removeImage(url)}
                                                    className="absolute top-2 right-2 w-7 h-7 bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                                                >
                                                    <X className="h-4 w-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Image Upload */}
                            <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-blue-400 transition-all">
                                <ImageUpload onUploadSuccess={handleImageUploadSuccess} />
                            </div>

                            {/* Uploaded Videos */}
                            {videoUrls.length > 0 && (
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                        <Video className="h-4 w-4" />
                                        Vídeo Carregado
                                    </label>
                                    <div className="space-y-3">
                                        {videoUrls.map((url, index) => (
                                            <div key={index} className="relative group rounded-xl overflow-hidden border-2 border-gray-200">
                                                <video src={url} controls className="w-full rounded-xl" />
                                                <button
                                                    type="button"
                                                    onClick={() => removeVideo(url)}
                                                    className="absolute top-2 right-2 w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-700 transition-all"
                                                >
                                                    <X className="h-4 w-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Video Upload */}
                            {videoUrls.length === 0 && (
                                <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-blue-400 transition-all">
                                    <VideoUpload onUploadSuccess={handleVideoUploadSuccess} />
                                </div>
                            )}
                        </div>

                        {/* Amenities Section */}
                        <div className="space-y-6 pt-6 border-t border-gray-200">
                            <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
                                <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center">
                                    <CheckCircle className="h-5 w-5 text-pink-600" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">Comodidades</h2>
                                    <p className="text-sm text-gray-600">Selecione as comodidades disponíveis no seu espaço</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {allAmenities.map((amenity) => (
                                    <label
                                        key={amenity.id}
                                        className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                                            selectedAmenities.has(amenity.id)
                                                ? 'border-blue-500 bg-blue-50'
                                                : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                                        }`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedAmenities.has(amenity.id)}
                                            onChange={() => handleAmenityChange(amenity.id)}
                                            className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className={`font-medium ${
                                            selectedAmenities.has(amenity.id) ? 'text-blue-700' : 'text-gray-700'
                                        }`}>
                                            {amenity.name}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                                <p className="text-red-600 font-medium">{error}</p>
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-lg rounded-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
                        >
                            <Sparkles className="h-5 w-5" />
                            Publicar Espaço
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}