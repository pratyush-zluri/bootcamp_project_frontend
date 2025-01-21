// src/pages/Login.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { useAuth } from '../App'; // Import the useAuth hook

const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const { login } = useAuth(); // Use the login function from the AuthContext

    const handleSuccess = (credentialResponse: CredentialResponse) => {
        const token = credentialResponse.credential;
        if (token) {
            console.log('Google OAuth Token:', token);

            const decoded = JSON.parse(atob(token.split('.')[1])); // Decode the JWT token payload
            const userInfo = {
                name: decoded.name,
                email: decoded.email,
                imageUrl: decoded.picture,
            };

            // Save the token and user info to localStorage
            localStorage.setItem('authToken', token);
            localStorage.setItem('user', JSON.stringify(userInfo));

            // Update the authentication state
            login();

            // Redirect to the dashboard
            toast.success('Login successful!');
            navigate('/dashboard'); // Replace '/dashboard' with the actual route of your dashboard page
        } else {
            toast.error('Google login failed. Please try again.');
        }
    };

    const handleFailure = () => {
        toast.error('Google login failed. Please try again.');
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#FBFBFB] to-[#F0F0F0] flex items-center justify-center">
            <div className="bg-white shadow-md rounded-lg p-8 w-full max-w-md">
                <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">Login</h2>
                <div className="text-center">
                    <GoogleLogin
                        onSuccess={handleSuccess}
                        onError={handleFailure}
                    />
                </div>
                <p className="text-sm text-center mt-4 text-gray-600">
                    By continuing, you agree to our{' '}
                    <span className="text-blue-600 hover:underline">Terms & Conditions</span>.
                </p>
            </div>
        </div>
    );
};

export default LoginPage;