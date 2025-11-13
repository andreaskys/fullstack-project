'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

type VideoUploadProps = {
    listingId: number;
};

export default function VideoUpload({ listingId }: VideoUploadProps) {
    const [file, setFile] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const { token, logout } = useAuth();
    const router = useRouter();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) {
            setError('Por favor, selecione um ficheiro de vídeo.');
            return;
        }

        setIsUploading(true);
        setError(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch(`/api/listings/${listingId}/videos`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData,
            });

            if (res.status === 403) {
                logout();
                return;
            }
            if (!res.ok) {
                throw new Error('Falha no upload do vídeo.');
            }

            alert('Vídeo enviado com sucesso!');
            setFile(null);
            (e.target as HTMLFormElement).reset();
            router.refresh();

        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="p-6 border border-gray-300 rounded-lg bg-gray-50 mt-4">
            <h3 className="text-xl font-semibold mb-4">Adicionar Novo Vídeo</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input
                    type="file"
                    onChange={handleFileChange}
                    accept="video/mp4, video/quicktime"
                    className="w-full text-sm text-gray-500
                     file:mr-4 file:py-2 file:px-4
                     file:rounded-md file:border-0
                     file:text-sm file:font-semibold
                     file:bg-purple-50 file:text-purple-700
                     hover:file:bg-purple-100"
                />
                {error && <p className="text-sm text-red-600">{error}</p>}
                <button
                    type="submit"
                    disabled={isUploading || !file}
                    className="w-full px-4 py-2 font-semibold text-white bg-purple-600 rounded-md
                     hover:bg-purple-700 disabled:bg-gray-400"
                >
                    {isUploading ? 'A enviar...' : 'Enviar Vídeo'}
                </button>
            </form>
        </div>
    );
}