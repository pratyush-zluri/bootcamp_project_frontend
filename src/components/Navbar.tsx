import React, { useState, useEffect } from 'react';
import { googleLogout } from '@react-oauth/google';
import { useNavigate, NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/AuthContext';

interface User {
    name: string;
    email: string;
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
        <header className="bg-[#E5D9F2] shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Left Section: Logo and Navigation */}
                    <div className="flex items-center">
                        {/* Logo */}
                        <h1 className='font-extrabold text-xl text-zinc-600'>Parsinator</h1>
                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex md:space-x-8 ml-6">
                            <NavLink
                                to="/dashboard"
                                className={({ isActive }) =>
                                    isActive ? 'text-indigo-600 font-bold' : 'text-gray-800 hover:text-[#A294F9] font-medium'
                                }
                            >
                                Transactions
                            </NavLink>
                            <NavLink
                                to="/softDeleted"
                                className={({ isActive }) =>
                                    isActive ? 'text-indigo-600 font-bold' : 'text-gray-800 hover:text-[#A294F9] font-medium'
                                }
                            >
                                Deleted
                            </NavLink>
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

                        {/* User Info */}
                        {user ? (
                            <div className="flex items-center space-x-3">
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
                            className="hidden md:block text-sm font-medium text-gray-700 hover:text-[#A294F9]"
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
                        <NavLink
                            to="/dashboard"
                            className={({ isActive }) =>
                                isActive ? 'block text-indigo-600 font-bold' : 'block text-gray-800 hover:text-[#A294F9] font-medium'
                            }
                        >
                            Dashboard
                        </NavLink>
                        <NavLink
                            to="/softDeleted"
                            className={({ isActive }) =>
                                isActive ? 'block text-indigo-600 font-bold' : 'block text-gray-800 hover:text-[#A294F9] font-medium'
                            }
                        >
                            Soft Deleted
                        </NavLink>
                        <button
                            onClick={handleLogout}
                            className="block w-full text-left text-sm font-medium text-gray-700 hover:text-[#A294F9]"
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