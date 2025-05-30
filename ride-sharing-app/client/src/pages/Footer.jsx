import { Link, useLocation } from "react-router-dom";
import { Search, PlusCircle, Inbox, User } from "lucide-react";

const Footer = () => {
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    return (
        <footer className="fixed bottom-0 left-0 w-full bg-gradient-to-r from-gray-900 to-black shadow-lg border-t border-gray-700">
            <div className="flex justify-between items-center p-4 text-gray-400"> 
                                {/* Search */}
                <Link 
                    to="/search" 
                    className={`flex flex-col items-center flex-1 group ${isActive('/search') ? 'text-blue-400' : ''}`}
                >
                    <Search 
                        size={24} 
                        className={`transition duration-300 transform group-hover:scale-110 group-hover:text-blue-400 
                            ${isActive('/search') ? 'text-blue-400 scale-110' : ''}`}
                    />
                    <span className={`text-sm transition duration-300 
                        ${isActive('/search') ? 'text-blue-400 font-medium' : 'group-hover:text-white'}`}
                    >
                        Search
                    </span>
                </Link>

                {/* Publish */}
                <Link 
                    to="/publish" 
                    className={`flex flex-col items-center flex-1 group ${isActive('/publish') ? 'text-green-400' : ''}`}
                >
                    <PlusCircle 
                        size={24} 
                        className={`transition duration-300 transform group-hover:scale-110 group-hover:text-green-400 
                            ${isActive('/publish') ? 'text-green-400 scale-110' : ''}`}
                    />
                    <span className={`text-sm transition duration-300 
                        ${isActive('/publish') ? 'text-green-400 font-medium' : 'group-hover:text-white'}`}
                    >
                        Publish
                    </span>
                </Link>

                {/* Inbox */}
                <Link 
                    to="/inbox" 
                    className={`flex flex-col items-center flex-1 group ${isActive('/inbox') ? 'text-yellow-400' : ''}`}
                >
                    <Inbox 
                        size={24} 
                        className={`transition duration-300 transform group-hover:scale-110 group-hover:text-yellow-400 
                            ${isActive('/inbox') ? 'text-yellow-400 scale-110' : ''}`}
                    />
                    <span className={`text-sm transition duration-300 
                        ${isActive('/inbox') ? 'text-yellow-400 font-medium' : 'group-hover:text-white'}`}
                    >
                        Inbox
                    </span>
                </Link>

                {/* Profile */}
                <Link 
                    to="/profile" 
                    className={`flex flex-col items-center flex-1 group ${isActive('/profile') ? 'text-purple-400' : ''}`}
                >
                    <User 
                        size={24} 
                        className={`transition duration-300 transform group-hover:scale-110 group-hover:text-purple-400 
                            ${isActive('/profile') ? 'text-purple-400 scale-110' : ''}`}
                    />
                    <span className={`text-sm transition duration-300 
                        ${isActive('/profile') ? 'text-purple-400 font-medium' : 'group-hover:text-white'}`}
                    >
                        Profile
                    </span>
                </Link>

            </div>
        </footer>
    );
};

export default Footer;

