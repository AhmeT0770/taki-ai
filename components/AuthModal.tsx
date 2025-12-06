import React, { useState } from 'react';
import { X, Mail, Lock, User, Loader2, Chrome } from 'lucide-react';
import { signInWithEmail, signUpWithEmail, signInWithGoogle } from '../services/supabaseClient';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

type AuthTab = 'login' | 'register';

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [activeTab, setActiveTab] = useState<AuthTab>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            if (activeTab === 'login') {
                await signInWithEmail(email, password);
            } else {
                await signUpWithEmail(email, password, name);
            }
            onSuccess();
            onClose();
        } catch (err: any) {
            console.error('Auth error:', err);
            if (err.message.includes('Invalid login credentials')) {
                setError('Email veya şifre hatalı');
            } else if (err.message.includes('User already registered')) {
                setError('Bu email zaten kayıtlı');
            } else if (err.message.includes('Password should be at least')) {
                setError('Şifre en az 6 karakter olmalı');
            } else {
                setError(err.message || 'Bir hata oluştu');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setIsLoading(true);
        setError(null);

        try {
            await signInWithGoogle();
            // Google OAuth will redirect, so we don't need to handle success here
        } catch (err: any) {
            console.error('Google auth error:', err);
            setError('Google ile giriş yapılamadı');
            setIsLoading(false);
        }
    };

    const resetForm = () => {
        setEmail('');
        setPassword('');
        setName('');
        setError(null);
    };

    const switchTab = (tab: AuthTab) => {
        setActiveTab(tab);
        resetForm();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            {/* Modal */}
            <div
                className="relative bg-white w-full max-w-md rounded-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-luxury-400 hover:text-luxury-900 transition-colors z-10"
                >
                    <X size={20} />
                </button>

                {/* Header */}
                <div className="bg-gradient-to-br from-luxury-900 to-luxury-800 px-8 py-8 text-white">
                    <h2 className="text-2xl font-serif font-bold mb-2">
                        {activeTab === 'login' ? 'Hoş Geldiniz' : 'Kayıt Olun'}
                    </h2>
                    <p className="text-luxury-200 text-sm">
                        {activeTab === 'login'
                            ? 'Devam etmek için giriş yapın'
                            : 'Sınırsız görsel üretimi için hesap oluşturun'}
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-luxury-200">
                    <button
                        onClick={() => switchTab('login')}
                        className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'login'
                                ? 'text-luxury-900 border-b-2 border-luxury-900'
                                : 'text-luxury-400 hover:text-luxury-600'
                            }`}
                    >
                        Giriş Yap
                    </button>
                    <button
                        onClick={() => switchTab('register')}
                        className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'register'
                                ? 'text-luxury-900 border-b-2 border-luxury-900'
                                : 'text-luxury-400 hover:text-luxury-600'
                            }`}
                    >
                        Kayıt Ol
                    </button>
                </div>

                {/* Content */}
                <div className="p-8">
                    {/* Google Login Button */}
                    <button
                        onClick={handleGoogleLogin}
                        disabled={isLoading}
                        className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-luxury-200 rounded-lg text-luxury-700 font-medium hover:bg-luxury-50 hover:border-luxury-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-6"
                    >
                        <Chrome size={20} className="text-[#4285F4]" />
                        Google ile {activeTab === 'login' ? 'Giriş Yap' : 'Kayıt Ol'}
                    </button>

                    {/* Divider */}
                    <div className="relative mb-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-luxury-200" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white px-4 text-luxury-400">veya</span>
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Name field (only for register) */}
                        {activeTab === 'register' && (
                            <div className="relative">
                                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-luxury-400" />
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Adınız"
                                    required={activeTab === 'register'}
                                    className="w-full pl-10 pr-4 py-3 border border-luxury-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-500 focus:border-transparent text-luxury-900 placeholder-luxury-400"
                                />
                            </div>
                        )}

                        {/* Email */}
                        <div className="relative">
                            <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-luxury-400" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Email adresiniz"
                                required
                                className="w-full pl-10 pr-4 py-3 border border-luxury-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-500 focus:border-transparent text-luxury-900 placeholder-luxury-400"
                            />
                        </div>

                        {/* Password */}
                        <div className="relative">
                            <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-luxury-400" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Şifreniz"
                                required
                                minLength={6}
                                className="w-full pl-10 pr-4 py-3 border border-luxury-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-500 focus:border-transparent text-luxury-900 placeholder-luxury-400"
                            />
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">
                                {error}
                            </div>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3 bg-luxury-900 text-white font-medium rounded-lg hover:bg-luxury-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    İşleniyor...
                                </>
                            ) : (
                                activeTab === 'login' ? 'Giriş Yap' : 'Kayıt Ol'
                            )}
                        </button>
                    </form>

                    {/* Info Text */}
                    <p className="mt-6 text-center text-xs text-luxury-400">
                        Giriş yaparak{' '}
                        <a href="#" className="text-luxury-600 hover:underline">Kullanım Şartları</a>
                        {' '}ve{' '}
                        <a href="#" className="text-luxury-600 hover:underline">Gizlilik Politikası</a>
                        'nı kabul etmiş olursunuz.
                    </p>
                </div>
            </div>
        </div>
    );
};
