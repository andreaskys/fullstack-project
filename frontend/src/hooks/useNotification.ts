'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useAuth } from '@/context/AuthContext';

export type Notification = {
    message: string;
    link: string;
    timestamp: number;
};

export function useNotifications() {
    const { token, isAuthenticated } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isConnected, setIsConnected] = useState(false);
    const stompClientRef = useRef<Client | null>(null);

    useEffect(() => {
        if (!isAuthenticated || !token) {
            console.log('Not authenticated, skipping WebSocket connection');
            return;
        }

        console.log('🔌 Attempting to connect to WebSocket...');

        const socket = new SockJS('http://localhost:8080/ws');

        const stompClient = new Client({
            webSocketFactory: () => socket,
            connectHeaders: {
                Authorization: `Bearer ${token}`
            },
            debug: (str) => {
                console.log('STOMP Debug:', str);
            },
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
            onConnect: () => {
                console.log('✅ Connected to WebSocket');
                setIsConnected(true);

                stompClient.subscribe('/user/topic/notification', (message) => {
                    try {
                        const notification = JSON.parse(message.body);
                        console.log('📬 Received notification:', notification);

                        const newNotification: Notification = {
                            ...notification,
                            timestamp: Date.now()
                        };

                        setNotifications(prev => [newNotification, ...prev]);
                        setUnreadCount(prev => prev + 1);

                        if (Notification.permission === 'granted') {
                            new Notification('Nova Notificação', {
                                body: notification.message,
                                icon: '/favicon.ico'
                            });
                        }
                    } catch (error) {
                        console.error('❌ Error parsing notification:', error);
                    }
                });
            },
            onStompError: (frame) => {
                console.error('❌ STOMP error:', frame);
                setIsConnected(false);
            },
            onWebSocketError: (error) => {
                console.error('❌ WebSocket error:', error);
                setIsConnected(false);
            },
            onDisconnect: () => {
                console.log('🔌 Disconnected from WebSocket');
                setIsConnected(false);
            }
        });

        stompClientRef.current = stompClient;

        try {
            stompClient.activate();
        } catch (error) {
            console.error('❌ Error activating STOMP client:', error);
        }

        if (typeof window !== 'undefined' && Notification.permission === 'default') {
            Notification.requestPermission();
        }

        return () => {
            console.log('🧹 Cleaning up WebSocket connection');
            if (stompClientRef.current) {
                stompClientRef.current.deactivate();
            }
        };
    }, [isAuthenticated, token]);

    const clearNotifications = useCallback(() => {
        setNotifications([]);
        setUnreadCount(0);
    }, []);

    const markAsRead = useCallback(() => {
        setUnreadCount(0);
    }, []);

    return {
        notifications,
        unreadCount,
        isConnected,
        clearNotifications,
        markAsRead
    };
}