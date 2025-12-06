import React, { useState, useEffect } from 'react';
import { MessageCircle, Send, User, UserCog } from 'lucide-react';
import { getFeedbackMessages, addFeedbackMessage } from '../services/supabaseClient';
import { Button } from './Button';

interface FeedbackMessage {
    id: string;
    created_at: string;
    message: string;
    is_admin: boolean;
    reply_to: string | null;
}

export const Feedback: React.FC = () => {
    const [messages, setMessages] = useState<FeedbackMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Load messages on mount
    useEffect(() => {
        loadMessages();
    }, []);

    const loadMessages = async () => {
        try {
            const data = await getFeedbackMessages();
            setMessages(data || []);
        } catch (err) {
            console.error('Mesajlar yüklenemedi:', err);
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        setIsLoading(true);
        try {
            // Check if this is an admin reply (simple check: if replying to something)
            const isAdmin = !!replyingTo;
            await addFeedbackMessage(newMessage, isAdmin, replyingTo || undefined);
            setNewMessage('');
            setReplyingTo(null);
            await loadMessages();
        } catch (err) {
            console.error('Mesaj gönderilemedi:', err);
            setError('Mesaj gönderilemedi. Lütfen tekrar deneyin.');
            setTimeout(() => setError(null), 3000);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-luxury-50 p-4">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-sm shadow-lg p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-serif font-bold text-luxury-900 flex items-center gap-2">
                            <MessageCircle size={28} />
                            Geri Bildirimler
                        </h2>
                    </div>

                    {/* Messages List */}
                    <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                        {messages.length === 0 ? (
                            <p className="text-center text-luxury-400 py-8">
                                Henüz mesaj yok. İlk mesajı gönderin!
                            </p>
                        ) : (
                            messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`p-4 rounded-sm ${msg.is_admin
                                        ? 'bg-luxury-100 ml-8'
                                        : 'bg-white border border-luxury-200'
                                        }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className={`p-2 rounded-full ${msg.is_admin ? 'bg-luxury-900' : 'bg-luxury-300'}`}>
                                            {msg.is_admin ? (
                                                <UserCog className="text-white" size={16} />
                                            ) : (
                                                <User className="text-luxury-700" size={16} />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-semibold text-sm text-luxury-900">
                                                    {msg.is_admin ? 'Admin' : 'Tester'}
                                                </span>
                                                <span className="text-xs text-luxury-400">
                                                    {new Date(msg.created_at).toLocaleString('tr-TR')}
                                                </span>
                                            </div>
                                            <p className="text-luxury-800 whitespace-pre-wrap">{msg.message}</p>
                                            {!msg.is_admin && (
                                                <button
                                                    onClick={() => setReplyingTo(msg.id)}
                                                    className="mt-2 text-xs text-luxury-500 hover:text-luxury-700 font-medium"
                                                >
                                                    Cevapla
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* New Message Form */}
                    <form onSubmit={handleSendMessage} className="border-t border-luxury-200 pt-4">
                        {replyingTo && (
                            <div className="mb-3 p-2 bg-luxury-50 rounded-sm flex items-center justify-between">
                                <span className="text-sm text-luxury-700">Cevap yazıyorsunuz...</span>
                                <button
                                    type="button"
                                    onClick={() => setReplyingTo(null)}
                                    className="text-xs text-luxury-500 hover:text-luxury-700"
                                >
                                    İptal
                                </button>
                            </div>
                        )}
                        {error && (
                            <div className="mb-3 p-3 bg-red-50 text-red-800 border border-red-200 rounded-sm text-sm">
                                {error}
                            </div>
                        )}
                        <div className="flex gap-2">
                            <textarea
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder={replyingTo ? "Cevabınızı yazın..." : "Mesajınızı yazın..."}
                                className="flex-1 px-4 py-3 border border-luxury-200 rounded-sm focus:outline-none focus:ring-2 focus:ring-luxury-500 resize-none"
                                rows={3}
                            />
                            <Button
                                type="submit"
                                disabled={!newMessage.trim() || isLoading}
                                isLoading={isLoading}
                                className="self-end"
                            >
                                <Send size={16} />
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
