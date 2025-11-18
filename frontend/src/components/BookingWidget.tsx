'use client';

import { useState } from 'react';
import { DateRange, Range } from 'react-date-range';
import { addDays } from 'date-fns';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

type BookingWidgetProps = {
    listingId: number;
    pricePerNight: number;
};

export default function BookingWidget({ listingId, pricePerNight }: BookingWidgetProps) {
    const { token, isAuthenticated, logout } = useAuth();
    const router = useRouter();

    const [dateRange, setDateRange] = useState<Range[]>([
        {
            startDate: new Date(),
            endDate: addDays(new Date(), 1),
            key: 'selection'
        }
    ]);

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    let numberOfNights = 0;
    if (dateRange[0].startDate && dateRange[0].endDate) {
        const diffTime = Math.abs(dateRange[0].endDate.getTime() - dateRange[0].startDate.getTime());
        numberOfNights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    const totalPrice = pricePerNight * numberOfNights;

    const handleBooking = async () => {
        if (!isAuthenticated) {
            router.push('/login');
            return;
        }
        if (numberOfNights === 0) {
            setError("Por favor, selecione pelo menos uma noite.");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const res = await fetch('/api/bookings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    listingId: listingId,
                    checkInDate: dateRange[0].startDate,
                    checkOutDate: dateRange[0].endDate
                })
            });

            if (res.status === 403) {
                logout();
                return;
            }

            if (res.status === 409) {
                setError("❌ As datas selecionadas já não estão disponíveis. Por favor, escolha outras datas.");
                return;
            }

            if (res.status === 400) {
                const errorData = await res.json();
                setError(errorData.message || "Dados inválidos. Verifique as datas selecionadas.");
                return;
            }

            if (!res.ok) {
                const errorData = await res.json().catch(() => null);
                setError(errorData?.message || "Não foi possível criar a reserva. Tente novamente.");
                return;
            }

            alert("✅ Reserva criada com sucesso!");
            router.push('/my-bookings');

        } catch (err: any) {
            console.error('Booking error:', err);
            setError("Erro ao criar reserva. Verifique sua conexão e tente novamente.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-6 border border-gray-300 rounded-lg bg-white shadow-lg mt-8">
            <h3 className="text-2xl font-semibold mb-4">
                R$ {pricePerNight.toFixed(2)}
                <span className="text-base font-normal text-gray-500"> / noite</span>
            </h3>

            <div className="flex justify-center">
                <DateRange
                    editableDateInputs={true}
                    onChange={item => setDateRange([item.selection as Range])}
                    moveRangeOnFirstSelection={false}
                    ranges={dateRange}
                    minDate={new Date()}
                    rangeColors={['#2563eb']}
                />
            </div>

            <div className="py-4 border-t border-b border-gray-200">
                <div className="flex justify-between text-lg">
                    <span>R$ {pricePerNight.toFixed(2)} x {numberOfNights} noites</span>
                    <span className="font-semibold">R$ {totalPrice.toFixed(2)}</span>
                </div>
            </div>

            <div className="flex justify-between text-xl font-bold mt-4">
                <span>Total</span>
                <span>R$ {totalPrice.toFixed(2)}</span>
            </div>

            {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-600 text-center">{error}</p>
                </div>
            )}

            <button
                onClick={handleBooking}
                disabled={isLoading || numberOfNights === 0}
                className="w-full mt-6 px-4 py-3 font-semibold text-white bg-blue-600 rounded-md
                   hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
                {isLoading ? 'A reservar...' : 'Reservar'}
            </button>
        </div>
    );
}