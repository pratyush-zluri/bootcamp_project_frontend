import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { useAuth } from '../App';
import { Loader2 } from 'lucide-react';

const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [isLoading, setIsLoading] = React.useState(false);

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

    const handleFailure = () => {
        toast.error('Login failed. Please try again.');
        setIsLoading(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col items-center justify-center p-4">
            {/* Logo Section */}
            <div className="mb-8 animate-fade-in">
                <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center mb-4 mx-auto shadow-lg">
                    <span className="text-2xl text-white font-bold">A</span>
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800 text-center">
                    Welcome back
                </h1>
                <p className="text-gray-600 text-center mt-2">
                    Please sign in to continue
                </p>
            </div>

            {/* Login Card */}
            <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl p-6 md:p-8 w-full max-w-md border border-gray-100 animate-slide-up">
                <div className="space-y-6">
                    {/* Google Login Button */}
                    <div className="relative">
                        {isLoading && (
                            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center rounded-lg z-10">
                                <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                            </div>
                        )}
                        <div className="flex justify-center">
                            <GoogleLogin
                                onSuccess={handleSuccess}
                                onError={handleFailure}
                                theme="outline"
                                size="large"
                                width="300"
                            />
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 text-gray-500 bg-white">
                                or continue with email
                            </span>
                        </div>
                    </div>

                    {/* Email Form Placeholder */}
                    <div className="space-y-4">
                        <button
                            className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                            onClick={() => toast.info('Email login coming soon!')}
                        >
                            Sign in with email
                        </button>
                    </div>
                </div>

                {/* Terms and Privacy */}
                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600">
                        By continuing, you agree to our{' '}
                        <button className="text-blue-600 hover:text-blue-800 transition-colors duration-200">
                            Terms of Service
                        </button>{' '}
                        and{' '}
                        <button className="text-blue-600 hover:text-blue-800 transition-colors duration-200">
                            Privacy Policy
                        </button>
                    </p>
                </div>
            </div>

            {/* Help Link */}
            <p className="mt-8 text-sm text-gray-600 animate-fade-in">
                Need help?{' '}
                <button className="text-blue-600 hover:text-blue-800 transition-colors duration-200">
                    Contact Support
                </button>
            </p>
        </div>
    );
};

export default LoginPage;