'use client';

import {
    createContext,
    useContext,
    useState,
    useEffect,
    ReactNode,
    useCallback,
    useRef
} from 'react';
import { useRouter } from 'next/navigation';
import { Client, IMessage } from "@stomp/stompjs";
import SockJS from 'sockjs-client';

export type Notification = {
    message: string;
    link: string;
}

interface AuthContextType {
    token: string | null;
    login: (token: string) => void;
    logout: () => void;
    isAuthenticated: boolean;
    notifications: Notification[];
    clearNotifications: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';
const SOCKET_URL = `${API_BASE_URL}/ws`;

export function AuthProvider({ children }: { children: ReactNode }) {
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const stompClientRef = useRef<Client | null>(null);

    const isAuthenticated = !!token;

    useEffect(() => {
        const storedToken = localStorage.getItem('jwtToken');
        if (storedToken) {
            setToken(storedToken);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        if(isAuthenticated && token && !stompClientRef.current){
            const client = new Client({
                webSocketFactory: () => new SockJS(SOCKET_URL),
                connectHeaders: { Authorization: `Bearer ${token}` },
                debug: (str) => { console.log(new Date(), str); },
                reconnectDelay: 5000,
            });

            client.onConnect = (frame)=> {
                console.log('AuthProvider: Ligado ao WebSocket para notificações.');
                client.subscribe('/user/topic/notifications', (message: IMessage) => {
                    const newNotification = JSON.parse(message.body) as Notification;
                    setNotifications((prevNotifications) => [newNotification, ...prevNotifications]);
                });
            };
            client.onStompError = (frame) => {
                console.error('Erro no Broker (STOMP):', frame.headers['message']);
                console.error('Detalhes Adicionais:', frame.body);
            };
            client.activate();
            stompClientRef.current = client;

        } else if(!isAuthenticated && stompClientRef.current){
            stompClientRef.current.deactivate();
            stompClientRef.current = null;
            console.log("authprovider: desconectado do web socket")
        }
    }, [isAuthenticated, token]);

    const login = useCallback((newToken: string) => {
        setToken(newToken);
        localStorage.setItem('jwtToken', newToken);
        router.push('/');
    }, [router]);

    const logout = useCallback(() => {
        setToken(null);
        localStorage.removeItem('jwtToken');

        if (stompClientRef.current) {
            stompClientRef.current.deactivate();
            stompClientRef.current = null;
        }
        setNotifications([]);

        router.push('/login');
    }, [router]);

    const clearNotifications = useCallback(() => {
        setNotifications([]);
    }, []);

    if (loading) {
        return null;
    }

    return (
        <AuthContext.Provider value={{
            token,
            login,
            logout,
            isAuthenticated,
            notifications,
            clearNotifications
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth deve ser usado dentro de um AuthProvider');
    }
    return context;
};