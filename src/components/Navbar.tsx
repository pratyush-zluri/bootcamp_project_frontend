// src/components/Navbar.tsx
import React, { useState, useEffect } from 'react';
import { googleLogout } from '@react-oauth/google';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../App'; // Import the useAuth hook

interface User {
    name: string;
    email: string;
    imageUrl: string;
}

const Navbar: React.FC = () => {
    const { logout, isAuthenticated } = useAuth(); // Use the login function and auth state from the AuthContext
    const [user, setUser] = useState<User | null>(null);
    const [menuOpen, setMenuOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated) {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            }
        }
    }, [isAuthenticated]);

    const handleLogout = () => {
        googleLogout();
        setUser(null);
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        logout();
        navigate('/login');
    };

    return (
        <header className="bg-white shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Left Section: Logo and Navigation */}
                    <div className="flex items-center">
                        {/* Logo */}
                        <h1 className='font-extrabold text-xl text-zinc-600'>Transactify</h1>
                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex md:space-x-8 ml-6">
                            <Link
                                to="/dashboard"
                                className="text-gray-800 hover:text-indigo-500 font-medium"
                            >
                                Dashboard
                            </Link>
                            <Link
                                to="/softDeleted"
                                className="text-gray-800 hover:text-indigo-500 font-medium"
                            >
                                Soft Deleted
                            </Link>
                        </nav>
                    </div>

                    {/* Right Section: User Info */}
                    <div className="flex items-center space-x-4">
                        {/* Mobile Menu Button */}
                        <button
                            className="md:hidden text-gray-700 hover:text-gray-900"
                            onClick={() => setMenuOpen(!menuOpen)}
                        >
                            <span className="sr-only">Open menu</span>
                            <svg
                                className="h-6 w-6"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 6h16M4 12h16m-7 6h7"
                                />
                            </svg>
                        </button>

                        {/* Notifications */}
                        <button className="bg-white p-1 rounded-full text-gray-400 hover:text-indigo-500">
                            <span className="sr-only">View notifications</span>
                            <i className="fas fa-bell"></i>
                        </button>

                        {/* User Info */}
                        {user ? (
                            <div className="flex items-center space-x-3">
                                <img
                                    alt="User Avatar"
                                    className="h-8 w-8 rounded-full"
                                    src={user.imageUrl}
                                />
                                <div className="hidden md:block">
                                    <p className="text-sm font-medium text-gray-800">
                                        {user.name}
                                    </p>
                                    <p className="text-xs text-gray-500">{user.email}</p>
                                </div>
                            </div>
                        ) : null}

                        {/* Logout Button */}
                        <button
                            onClick={handleLogout}
                            className="hidden md:block text-sm font-medium text-gray-700 hover:text-indigo-500"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation */}
            {menuOpen && (
                <nav className="md:hidden bg-white shadow-md">
                    <div className="space-y-2 px-4 py-4">
                        <Link
                            to="/dashboard"
                            className="block text-gray-800 hover:text-indigo-500 font-medium"
                        >
                            Dashboard
                        </Link>
                        <Link
                            to="#"
                            className="block text-gray-800 hover:text-indigo-500 font-medium"
                        >
                            Transactions
                        </Link>
                        <Link
                            to="#"
                            className="block text-gray-800 hover:text-indigo-500 font-medium"
                        >
                            Reports
                        </Link>
                        <Link
                            to="/softDeleted"
                            className="block text-gray-800 hover:text-indigo-500 font-medium"
                        >
                            Soft Deleted
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="block w-full text-left text-sm font-medium text-gray-700 hover:text-indigo-500"
                        >
                            Logout
                        </button>
                    </div>
                </nav>
            )}
        </header>
    );
};

export default Navbar;