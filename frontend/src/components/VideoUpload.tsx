'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

type VideoUploadProps = {
    onUploadSuccess: (url: string) => void;
};

export default function VideoUpload({ onUploadSuccess }: VideoUploadProps) {
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

    const handleUpload = async (e: React.FormEvent) => {
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
            const res = await fetch('/api/media/upload', {
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

            const data = await res.json();
            alert('Imagem enviada com sucesso!');
            onUploadSuccess(data.url);
            setFile(null);

        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="p-6 border border-gray-300 rounded-lg bg-gray-50">
            <h3 className="text-xl font-semibold mb-4 text-gray-900">Video de Capa </h3>
            <div className="space-y-4">
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
                    type="button"
                    onClick={handleUpload}
                    disabled={isUploading || !file}
                    className="w-full px-4 py-2 font-semibold text-white bg-green-600 rounded-md
                     hover:bg-green-700 disabled:bg-gray-400"
                >
                    {isUploading ? 'A enviar...' : 'Enviar Vídeo'}
                </button>
            </div>
        </div>
    );
}