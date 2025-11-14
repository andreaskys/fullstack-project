'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

type DeleteButtonProps = {
    listingId: number;
    onDeleteSuccess: (deletedListingId: number) => void;
};

export default function DeleteListingButton({ listingId, onDeleteSuccess }: DeleteButtonProps) {
    const { token, logout } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleDelete = async () => {
        if (!window.confirm("Tem a certeza que quer apagar este espaço? Esta ação é irreversível e apagará todas as reservas e imagens associadas.")) {
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const res = await fetch(`/api/listings/${listingId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (res.status === 403) { logout(); return; }
            if (!res.ok) {
                throw new Error("Falha ao apagar o espaço.");
            }

            alert("Espaço apagado com sucesso.");

            onDeleteSuccess(listingId);

        } catch (err: any) {
            setError(err.message);
            alert(`Erro: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            onClick={handleDelete}
            disabled={isLoading}
            className="px-3 py-2 text-sm font-semibold text-white bg-red-600 rounded-md hover:bg-red-700 disabled:bg-gray-400"
        >
            {isLoading ? "A apagar..." : "Apagar"}
        </button>
    );
}