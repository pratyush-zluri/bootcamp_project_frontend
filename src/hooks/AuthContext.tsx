import React, { createContext, useEffect, useState, useContext, ReactNode } from 'react';

interface AuthContextType {
    isAuthenticated: boolean;
    login: () => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('authToken'));

    const login = () => {
        setIsAuthenticated(true);
        const timeout = setTimeout(() => logout(), 600000); // Set timeout for 10 minutes
        localStorage.setItem('logoutTimeout', timeout.toString());
    };

    const logout = () => {
        setIsAuthenticated(false);
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        const timeout = localStorage.getItem('logoutTimeout');
        if (timeout) clearTimeout(Number(timeout));
        localStorage.removeItem('logoutTimeout');
    };

    useEffect(() => {
        const handleActivity = () => {
            const timeout = localStorage.getItem('logoutTimeout');
            if (timeout) clearTimeout(Number(timeout));
            const newTimeout = setTimeout(() => logout(), 600000); // Reset timeout for another 10 minutes
            localStorage.setItem('logoutTimeout', newTimeout.toString());
        };

        window.addEventListener('mousemove', handleActivity);
        window.addEventListener('keypress', handleActivity);

        return () => {
            window.removeEventListener('mousemove', handleActivity);
            window.removeEventListener('keypress', handleActivity);
        };
    }, []);

    return (
        <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};