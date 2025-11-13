'use client';

import { useState, useRef, useEffect } from 'react';
import { useChat } from '@/hooks/useChat';
import { useAuth } from '@/context/AuthContext';

type ChatBoxProps = {
    roomId: string;
};

export default function ChatBox({ roomId }: ChatBoxProps) {
    const { messages, isConnected, sendMessage, error } = useChat(roomId);
    const { token } = useAuth();

    const [newMessage, setNewMessage] = useState('');

    let currentUserId: number | null = null;
    if (token) {
        try {
            currentUserId = JSON.parse(atob(token.split('.')[1])).userId;
        } catch (e) {
            console.error("Token inválido no ChatBox", e);
        }
    }

    const messagesEndRef = useRef<null | HTMLDivElement>(null);
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };
    useEffect(scrollToBottom, [messages]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim() && isConnected) {
            sendMessage(newMessage);
            setNewMessage('');
        }
    };

    return (
        <div className="flex flex-col h-[60vh] max-w-lg mx-auto bg-white shadow-lg rounded-lg border">

            <div className="flex justify-between items-center p-4 border-b">
                <h2 className="text-xl font-semibold">Chat</h2>
                <span className={`h-3 w-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
            </div>

            <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
                {messages.map((msg, index) => {
                    const isMyMessage = msg.senderId === currentUserId;

                    return (
                        <div
                            key={index}
                            className={`flex mb-3 ${isMyMessage ? 'justify-end' : 'justify-start'}`}
                        >
                            <div>
                                {!isMyMessage && (
                                    <span className="text-xs text-gray-500 ml-2">{msg.senderName}</span>
                                )}
                                <div
                                    className={`p-3 rounded-lg max-w-xs ${
                                        isMyMessage
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-200 text-gray-800'
                                    }`}
                                >
                                    {msg.content}
                                </div>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {error && <p className="p-2 text-xs text-red-600">{error}</p>}

            <form onSubmit={handleSendMessage} className="p-4 border-t flex gap-2">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={isConnected ? "Escreva a sua mensagem..." : "A ligar ao chat..."}
                    className="flex-grow p-2 border border-gray-300 rounded-lg"
                    disabled={!isConnected}
                />
                <button
                    type="submit"
                    className="px-4 py-2 text-white bg-blue-600 rounded-lg disabled:bg-gray-400"
                    disabled={!isConnected || !newMessage.trim()}
                >
                    Enviar
                </button>
            </form>
        </div>
    );
}