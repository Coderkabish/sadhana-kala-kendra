import React, { useState } from "react";
import { Link, useNavigate, Outlet, useLocation } from "react-router-dom";
import { Menu, X, LogOut, Shield, LayoutDashboard, Users, BookOpen, Calendar, Image, Briefcase, UserCircle, Grid, CheckSquare } from "lucide-react";
import api from "./services/api";

const getIconForRoute = (path) => {
    switch (path) {
        case "/admin":
            return LayoutDashboard;
        case "/admin/about":
            return Briefcase;
        case "/admin/courses":
            return BookOpen;
        case "/admin/activities":
            return Grid; 
        case "/admin/artists":
            return UserCircle; 
        case "/admin/events":
            return Calendar;
        case "/admin/news":
            return Image;
        case "/admin/offers":
            return Briefcase;
        case "/admin/gallery":
            return Image;
        case "/admin/teachers":
            return Users;
        case "/admin/register": 
            return CheckSquare; 
        default:
            return Shield;
    }
};

const AdminLayout = ({ onLogout, adminUsername = "Admin" }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = async () => {
        try {
            // Call logout endpoint to clear cookie on server
            await api.post("/admin/logout");

            // Trigger parent callback if provided
            if (onLogout) onLogout();
            
            // Redirect to login
            navigate("/admin/login", { replace: true });
        } catch (error) {
            console.error("Logout failed or network error:", error);
            
            // Still logout on client side even if API call fails
            if (onLogout) onLogout();
            navigate("/admin/login", { replace: true });
        }
    };

    const navLinks = [
        { to: "/admin", label: "Sadhana Dashboard", icon: LayoutDashboard },
        { to: "/admin/register", label: "Registrations", icon: CheckSquare }, 
        { to: "/admin/courses", label: "Courses", icon: BookOpen },
        { to: "/admin/gallery", label: "Gallery", icon: Image },
        { to: "/admin/teachers", label: "Teachers", icon: Users },
        { to: "/admin/activities", label: "Activities", icon: Grid },
        { to: "/admin/artists", label: "Artists", icon: UserCircle },
        { to: "/admin/events", label: "Events", icon: Calendar },
        { to: "/admin/news", label: "News", icon: Image },
        { to: "/admin/offers", label: "Offers", icon: Briefcase },
        { to: "/admin/about", label: "About", icon: Briefcase },
    ];

    const MenuIcon = sidebarOpen ? X : Menu;

    return (
        <div className="flex h-screen bg-gray-100 font-['Inter']">
            
            <aside
                aria-label="Sidebar navigation"
                className={`fixed md:static z-30 bg-white shadow-2xl md:shadow-lg flex flex-col transform transition-transform duration-300 ease-in-out w-64 h-full
                ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
            >
                
                <div className="p-5 flex items-center justify-between border-b border-gray-100">
                    <Link to="/admin" className="flex items-center gap-2" onClick={() => setSidebarOpen(false)}>
                        <Shield className="text-red-600 text-2xl" />
                        <h1 className="text-xl font-extrabold text-gray-800 tracking-tight">
                            Admin Portal
                        </h1>
                    </Link>
                    
                    <button
                        className="md:hidden text-gray-500 hover:text-red-600 p-2 rounded-full hover:bg-red-50 transition"
                        onClick={() => setSidebarOpen(false)}
                        aria-label="Close menu"
                    >
                        <X size={20} />
                    </button>
                </div>

                <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
                    {navLinks.map((link) => {
                        const isActive = 
                            location.pathname === link.to ||
                            (link.to !== "/admin" && location.pathname.startsWith(link.to));

                        const Icon = link.icon; 
                        return (
                            <Link
                                key={link.to}
                                to={link.to}
                                onClick={() => setSidebarOpen(false)}
                                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold transition duration-200 ease-in-out ${
                                    isActive
                                        ? "bg-red-600 text-white shadow-md"
                                        : "hover:bg-red-50 hover:text-red-600 text-gray-700"
                                }`}
                                aria-current={isActive ? "page" : undefined}
                            >
                                <Icon size={18} />
                                <span>{link.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-gray-100">
                    <p className="text-xs text-gray-500 mb-2">Logged in as: {adminUsername}</p>
                    <button
                        onClick={handleLogout}
                        className="flex items-center justify-center w-full gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-100 hover:text-red-600 transition"
                    >
                        <LogOut size={18} />
                        Logout
                    </button>
                </div>
            </aside>

            <div className="flex-1 flex flex-col min-w-0">
                
                <header className="bg-white shadow-md p-4 flex justify-between items-center z-20 sticky top-0 h-16">
                    <div className="flex items-center gap-3">
                        
                        <button
                            className="md:hidden text-gray-700 hover:text-red-600 p-2 rounded-full transition"
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            aria-label="Toggle menu"
                        >
                            <MenuIcon size={24} />
                        </button>
                        <h2 className="text-lg font-bold text-gray-700 truncate">
                            {navLinks.find(link => location.pathname.startsWith(link.to))?.label || "Admin Panel"}
                        </h2>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-50">
                    <Outlet />
                </main>
            </div>

            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-40 z-20 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                    aria-hidden="true"
                ></div>
            )}
        </div>
    );
};

export default AdminLayout;