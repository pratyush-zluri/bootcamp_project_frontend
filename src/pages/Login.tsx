import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { useAuth } from '../App';
import { Loader2, Mail, Lock } from 'lucide-react';

const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSuccess = async (credentialResponse: CredentialResponse) => {
        try {
            setIsLoading(true);
            const token = credentialResponse.credential;

            if (token) {
                const decoded = JSON.parse(atob(token.split('.')[1]));
                const userInfo = {
                    name: decoded.name,
                    email: decoded.email,
                    imageUrl: decoded.picture,
                };

                localStorage.setItem('authToken', token);
                localStorage.setItem('user', JSON.stringify(userInfo));
                login();

                toast.success('Welcome back, ' + decoded.name + '! 👋');
                navigate('/dashboard');
            } else {
                throw new Error('No token received');
            }
        } catch {
            toast.error('Login failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleEmailLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Hardcoded credentials
        if (email === 'test@example.com' && password === 'password123') {
            const userInfo = {
                name: 'Test User',
                email: 'test@example.com',
                imageUrl: '/avatar.png',
            };

            localStorage.setItem('authToken', 'dummy-token');
            localStorage.setItem('user', JSON.stringify(userInfo));
            login();

            toast.success('Welcome back, Test User! 👋');
            navigate('/dashboard');
        } else {
            toast.error('Invalid credentials. Use test@example.com / password123');
        }

        setIsLoading(false);
    };

    return (
        <div className="min-h-screen bg-[#F5EFFF] flex flex-col items-center justify-center p-4">
            <div className="mb-8 animate-fade-in">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-800 text-center">
                    Welcome back
                </h1>
                <p className="text-gray-600 text-center mt-2">
                    Please sign in to continue
                </p>
            </div>

            <div className="bg-white/90 backdrop-blur-lg shadow-2xl rounded-2xl p-8 w-full max-w-md border border-white/20 animate-slide-up">
                <form onSubmit={handleEmailLogin} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email
                        </label>
                        <div className="relative">
                            <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A294F9] focus:border-transparent"
                                placeholder="test@example.com"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Password
                        </label>
                        <div className="relative">
                            <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A294F9] focus:border-transparent"
                                placeholder="password123"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full px-4 py-3 text-sm font-medium text-white bg-indigo-500 rounded-lg hover:bg-indigo-800 transition-all duration-200"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                        ) : (
                            'Sign In'
                        )}
                    </button>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 text-gray-500 bg-white">
                                or continue with
                            </span>
                        </div>
                    </div>

                    <div className="relative">
                        {isLoading && (
                            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center rounded-lg z-10">
                                <Loader2 className="w-6 h-6 text-[#A294F9] animate-spin" />
                            </div>
                        )}
                        <div className="flex justify-center">
                            <GoogleLogin
                                onSuccess={handleSuccess}
                                onError={() => toast.error('Login failed')}
                                theme="outline"
                                size="large"
                                width="300"
                            />
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;