// src/App.tsx
import React, { createContext, useEffect, useState, useContext, ReactNode } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useNavigate } from 'react-router-dom';
import LoginPage from './pages/Login';
import Dashboard from './pages/Dashboard';
import SoftDeletedTransactions from './pages/softDeleted';
import { ToastContainer } from 'react-toastify';
import Navbar from './components/Navbar';

interface AuthProviderProps {
  children: ReactNode;
}

// Create an AuthContext to manage authentication state globally
const AuthContext = createContext<{ isAuthenticated: boolean; login: () => void; logout: () => void } | undefined>(undefined);

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
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
    if (timeout) clearTimeout(parseInt(timeout));
  };

  useEffect(() => {
    const handleActivity = () => {
      const timeout = localStorage.getItem('logoutTimeout');
      if (timeout) clearTimeout(parseInt(timeout));
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

const App: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div>
      <ToastContainer />
      {isAuthenticated && <Navbar />} {/* Display Navbar if logged in */}
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="/softDeleted" element={isAuthenticated ? <SoftDeletedTransactions /> : <Navigate to="/login" />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </div>
  );
};

const AppWrapper: React.FC = () => (
  <Router>
    <AuthProvider>
      <App />
    </AuthProvider>
  </Router>
);

export default AppWrapper;