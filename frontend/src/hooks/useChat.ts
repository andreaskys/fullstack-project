'use client';

import { useState, useEffect, useRef } from 'react';
import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useAuth } from '@/context/AuthContext';

export interface ChatMessage {
    senderName: string;
    senderId: number;
    content: string;
}

export interface UseChatReturn {
    messages: ChatMessage[];
    isConnected: boolean;
    sendMessage: (content: string) => void;
    error: string | null;
}

const SOCKET_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/ws';

export const useChat = (roomId: string): UseChatReturn => {
    const { token, isAuthenticated } = useAuth();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const stompClientRef = useRef<Client | null>(null);
    const subscriptionRef = useRef<StompSubscription | null>(null);

    useEffect(() => {
        if (!isAuthenticated || !roomId || !token) {
            return;
        }

        const client = new Client({
            brokerURL: SOCKET_URL,

            webSocketFactory: () => {
                return new SockJS(SOCKET_URL);
            },

            connectHeaders: {
                Authorization: `Bearer ${token}`,
            },

            debug: (str) => {
                console.log(new Date(), str);
            },

            reconnectDelay: 5000,
        });

        client.onConnect = (frame) => {
            setIsConnected(true);
            setError(null);
            console.log('Ligado ao WebSocket:', frame);

            subscriptionRef.current = client.subscribe(
                `/topic/chat/${roomId}`,
                (message: IMessage) => {
                    const newMessage = JSON.parse(message.body) as ChatMessage;
                    setMessages((prevMessages) => [...prevMessages, newMessage]);
                }
            );
        };

        client.onStompError = (frame) => {
            setError(`Erro no Broker: ${frame.headers['message']} | ${frame.body}`);
            setIsConnected(false);
        };

        client.onDisconnect = () => {
            setIsConnected(false);
            console.log('Desligado do WebSocket.');
        };

        client.activate();

        stompClientRef.current = client;

        return () => {
            if (stompClientRef.current) {
                subscriptionRef.current?.unsubscribe();
                stompClientRef.current.deactivate();
                setIsConnected(false);
            }
        };
    }, [roomId, isAuthenticated, token]);

    const sendMessage = (content: string) => {
        if (!stompClientRef.current || !isConnected || !token) {
            setError("Não é possível enviar mensagem. Não está ligado.");
            return;
        }

        try {
            const decodedToken = JSON.parse(atob(token.split('.')[1]));
            const senderName = decodedToken.firstName || "Utilizador";
            const senderId = decodedToken.userId || 0;

            const chatMessage: ChatMessage = {
                senderName: senderName,
                senderId: senderId,
                content: content,
            };

            stompClientRef.current.publish({
                destination: `/app/chat.sendMessage/${roomId}`,
                body: JSON.stringify(chatMessage),
            });

        } catch (e: any) {
            setError(`Falha ao enviar mensagem: ${e.message}`);
        }
    };

    return { messages, isConnected, sendMessage, error };
};