import React, { useEffect, useState, useCallback } from "react";
import Cookies from 'js-cookie'; 
import { useNavigate } from "react-router-dom"; // Add this import
import PageLoader from "../../../components/PageLoader";

// Assuming these are the correct paths for your project structure
import { getAllBOD, getAllPrograms } from "../../services/aboutService.js"; 
import { getAllCourses } from "../../services/coursesService.js"; 
import { getAllEvents } from "../../services/eventsService.js"; 
import { getAllTeachers } from "../../services/teachersService.js";
import { getAllArtists } from "../../services/artistsService.js"; 
import RegisterService from "../../services/registerServices.js";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

// --- Enhanced Icons Collection ---
const Icons = {
    Users: (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    History: (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
    Book: (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
    Calendar: (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
    Gallery: (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
    Palette: (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M16.2 7.8l-1.4.7c-1.5.8-3.1 1.2-4.8 1.2s-3.3-.4-4.8-1.2l-1.4-.7"/></svg>,
    Target: (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
    Briefcase: (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>,
    CheckSquare: (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>,
    ArrowRight: (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
    Eye: (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
    Download: (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
    RefreshCw: (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>,
    TrendingUp: (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
    AlertCircle: (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
};

// --- Enhanced StatCard with Click Navigation ---
const StatCard = ({ title, value, color, icon: Icon, onClick, isClickable }) => (
    <div 
        onClick={isClickable ? onClick : undefined}
        className={`
            p-6 rounded-2xl shadow-lg bg-white border-t-4 ${color.border}
            flex flex-col space-y-3
            ${isClickable ? 'cursor-pointer hover:shadow-2xl transition-shadow duration-300' : ''}
        `}
    >
        <div className="flex items-center justify-between">
            <div className={`p-3 rounded-full ${color.bg} text-white`}>
                <Icon className="w-6 h-6" /> 
            </div>
            <p className="text-4xl font-extrabold text-gray-900">{value}</p>
        </div>
        <div className="flex items-center justify-between">
            <p className="text-sm font-semibold uppercase tracking-wider text-gray-500">{title}</p>
            {isClickable && <Icons.ArrowRight className="w-4 h-4 text-gray-400" />}
        </div>
    </div>
);

// --- Loading Skeleton ---
const StatCardSkeleton = () => (
    <div className="p-6 rounded-2xl shadow-lg bg-white/50 border-t-4 border-gray-300 animate-pulse flex flex-col space-y-3 h-34">
        <div className="flex items-center justify-between">
            <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
            <div className="h-8 bg-gray-300 rounded w-1/4"></div>
        </div>
        <div className="h-4 bg-gray-300 rounded w-2/3"></div>
    </div>
);

// --- Quick Action Button ---
const QuickActionButton = ({ icon: Icon, label, onClick, colorClass = "bg-slate-700 hover:bg-slate-800" }) => (
    <button
        onClick={onClick}
        className={`
            ${colorClass} text-white px-4 py-3 rounded-lg
            flex items-center space-x-2 text-sm font-medium
            transition-colors duration-200
            shadow-md hover:shadow-lg
        `}
    >
        <Icon className="w-5 h-5" />
        <span>{label}</span>
    </button>
);

// --- Alert Card for Pending Items ---
const AlertCard = ({ count, message, color = "orange" }) => {
    const colorClasses = {
        orange: "bg-orange-50 border-orange-200 text-orange-800",
        red: "bg-red-50 border-red-200 text-red-800",
        blue: "bg-blue-50 border-blue-200 text-blue-800",
    };

    return (
        <div className={`p-4 rounded-lg border ${colorClasses[color]} flex items-start space-x-3`}>
            <Icons.AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
            <div>
                <p className="font-semibold text-sm">{count} {message}</p>
            </div>
        </div>
    );
};


const AdminHome = () => { 
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        bodCount: 0,
        programCount: 0,
        coursesCount: 0,
        eventsCount: 0,
        teachersCount: 0,
        artistsCount: 0,
        registrationsCount: 0,
    });
    
    const [registrationStats, setRegistrationStats] = useState({
        reviewed: 0,
        unreviewed: 0,
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [authReady, setAuthReady] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token') || Cookies.get('token'); 
        setAuthReady(true);
    }, []);

    const fetchStats = useCallback(async () => {
        if (!authReady) return;

        setLoading(true);
        setError(null);
        try {
            const [bod, program, courses, events, teachers, artists, registrations] = await Promise.all([
                getAllBOD(),
                getAllPrograms(),
                getAllCourses(),
                getAllEvents(),
                getAllTeachers(),
                getAllArtists(),
                RegisterService.getAllRegistrations(),
            ]);

            setStats({
                bodCount: bod.length,
                programCount: program.length,
                coursesCount: courses.length,
                eventsCount: events.length,
                teachersCount: teachers.length,
                artistsCount: artists.length,
                registrationsCount: registrations.length, 
            });
            
            const unreviewed = registrations.filter((r) => r.status === "Unread").length;
            const reviewed = registrations.filter((r) => r.status !== "Unread").length;
            setRegistrationStats({ reviewed, unreviewed });

        } catch (err) {
            console.error("Error fetching stats:", err);
            const msg = err.response?.status === 401 
                ? "Unauthorized (401). Your session may have expired. Please log in again." 
                : "Failed to load dashboard data. Check backend and service endpoints.";
            setError(msg);
        } finally {
            setLoading(false);
        }
    }, [authReady]);

    useEffect(() => {
        if (authReady) fetchStats();
    }, [authReady, fetchStats]);

    
    const statCardsData = [
        { title: "New Registrations", value: stats.registrationsCount, color: { border: "border-green-500", bg: "bg-green-600" }, icon: Icons.CheckSquare, path: "register", clickable: true },
        { title: "BOD Members", value: stats.bodCount, color: { border: "border-indigo-500", bg: "bg-indigo-600" }, icon: Icons.Briefcase, path: "about", clickable: true },
        { title: "Program Records", value: stats.programCount, color: { border: "border-gray-500", bg: "bg-gray-600" }, icon: Icons.History, path: "about", clickable: true },
        { title: "Courses Offered", value: stats.coursesCount, color: { border: "border-teal-500", bg: "bg-teal-600" }, icon: Icons.Book, path: "courses", clickable: true },
        { title: "Events Scheduled", value: stats.eventsCount, color: { border: "border-orange-500", bg: "bg-orange-600" }, icon: Icons.Calendar, path: "events", clickable: true },
        { title: "Teachers/Staff", value: stats.teachersCount, color: { border: "border-red-500", bg: "bg-red-600" }, icon: Icons.Target, path: "teachers", clickable: true },
        { title: "Artists Featured", value: stats.artistsCount, color: { border: "border-blue-500", bg: "bg-blue-600" }, icon: Icons.Palette, path: "artists", clickable: true },
    ];
    
    // Combined data for comparison chart
    const comparisonData = [
        { name: "Reviewed", value: registrationStats.reviewed, fill: "#16a34a" },
        { name: "Unreviewed", value: registrationStats.unreviewed, fill: "#dc2626" },
    ];
    
    // Individual pie chart data
    const reviewedData = [{ name: "Reviewed", value: registrationStats.reviewed }];
    const unreviewedData = [{ name: "Unreviewed", value: registrationStats.unreviewed }];
    
    // Calculate percentage
    const totalRegs = stats.registrationsCount;
    const reviewedPercentage = totalRegs > 0 ? ((registrationStats.reviewed / totalRegs) * 100).toFixed(1) : 0;
    const unreviewedPercentage = totalRegs > 0 ? ((registrationStats.unreviewed / totalRegs) * 100).toFixed(1) : 0;
    
    const handleNavigation = (path) => {
    // 1. Construct the full path. 
    // If your App.js routes are defined as "/admin/register", etc.
    const fullPath = `/admin/${path}`;
    
    console.log(`Navigating to: ${fullPath}`); // For debugging

    if (typeof navigate === 'function') {
        navigate(fullPath);
    } else {
        console.warn(`Router not available. Simulating navigation to: ${fullPath}`);
    }
}

    const handleRefresh = () => {
        fetchStats();
    };

    return (
      <div className="min-h-screen bg-slate-50">
        <div className="container mx-auto p-4 md:p-8 lg:p-12 font-sans">
            {/* PAGE HEADER */}
            <header className="mb-8">
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <h1 className="text-4xl font-bold text-slate-800 tracking-tight">
                            Content Dashboard
                        </h1>
                        <p className="text-slate-600 mt-2 text-base">
                            Monitor all key activity happening across your platform.
                        </p>
                    </div>
                    <button
                        onClick={handleRefresh}
                        disabled={loading}
                        className="bg-slate-700 hover:bg-slate-800 text-white px-4 py-2 rounded-lg flex items-center space-x-2 text-sm font-medium transition-colors duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Icons.RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        <span>Refresh</span>
                    </button>
                </div>
            </header>

            {/* ERROR MESSAGE */}
            {error && (
                <div className="bg-red-50 border-l-4 border-red-500 text-red-800 px-6 py-4 rounded-lg mb-8 shadow-md">
                    <div className="flex items-start space-x-3">
                        <Icons.AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
                        <div>
                            <p className="font-semibold text-lg">Error Loading Data</p>
                            <p className="text-sm mt-1">{error}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* ALERTS SECTION */}
            {!loading && registrationStats.unreviewed > 0 && (
                <div className="mb-8">
                    <AlertCard 
                        count={registrationStats.unreviewed} 
                        message="unreviewed registrations need your attention" 
                        color="orange" 
                    />
                </div>
            )}

            {/* STATISTICS GRID */}
            <section className="mb-10">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-semibold text-slate-800">
                        Overview
                    </h2>
                    <p className="text-sm text-slate-500">
                        Click on any card to view details
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {loading || !authReady
                        ? statCardsData.map((_, index) => <StatCardSkeleton key={index} />)
                        : statCardsData.map((card, index) => (
                            <StatCard
                                key={index}
                                title={card.title}
                                value={card.value}
                                color={card.color}
                                icon={card.icon}
                                onClick={() => handleNavigation(card.path)}
                                isClickable={card.clickable}
                            />
                        ))}
                </div>
            </section>

            {/* QUICK ACTIONS PANEL */}
            <section className="mb-10">
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4">
                        Quick Actions
                    </h3>
                    <div className="flex flex-wrap gap-3">
                        <QuickActionButton 
                            icon={Icons.Eye} 
                            label="View All Registrations" 
                            onClick={() => handleNavigation('register')}
                        />
                        <QuickActionButton 
                            icon={Icons.Calendar} 
                            label="Manage Events" 
                            onClick={() => handleNavigation('events')}
                            colorClass="bg-orange-600 hover:bg-orange-700"
                        />
                        <QuickActionButton 
                            icon={Icons.Book} 
                            label="Edit Courses" 
                            onClick={() => handleNavigation('courses')}
                            colorClass="bg-teal-600 hover:bg-teal-700"
                        />
                        <QuickActionButton 
                            icon={Icons.Users} 
                            label="Manage Teachers" 
                            onClick={() => handleNavigation('teachers')}
                            colorClass="bg-red-600 hover:bg-red-700"
                        />
                    </div>
                </div>
            </section>

            {/* ANALYTICS SECTION */}
            <section className="mb-10">
                <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-2xl font-semibold text-slate-800">
                            Registration Analytics
                        </h3>
                        <Icons.TrendingUp className="w-6 h-6 text-slate-400" />
                    </div>
                    
                    {loading ? (
                        <PageLoader message="Loading analytics..." />
                    ) : (
                        <div className="space-y-8">
                            {/* Summary Stats Bar */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                                    <p className="text-sm font-medium text-slate-600 mb-1">Total Registrations</p>
                                    <p className="text-3xl font-bold text-slate-900">{stats.registrationsCount}</p>
                                </div>
                                <div className="bg-green-50 p-5 rounded-xl border border-green-200">
                                    <p className="text-sm font-medium text-green-700 mb-1">Reviewed</p>
                                    <div className="flex items-end justify-between">
                                        <p className="text-3xl font-bold text-green-600">{registrationStats.reviewed}</p>
                                        <p className="text-lg font-semibold text-green-600">{reviewedPercentage}%</p>
                                    </div>
                                </div>
                                <div className="bg-red-50 p-5 rounded-xl border border-red-200">
                                    <p className="text-sm font-medium text-red-700 mb-1">Pending Review</p>
                                    <div className="flex items-end justify-between">
                                        <p className="text-3xl font-bold text-red-600">{registrationStats.unreviewed}</p>
                                        <p className="text-lg font-semibold text-red-600">{unreviewedPercentage}%</p>
                                    </div>
                                </div>
                            </div>

                            {/* Charts Grid */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Bar Chart - Overview */}
                                <div className="lg:col-span-1 bg-slate-50 p-6 rounded-xl border border-slate-200">
                                    <h4 className="font-semibold text-base text-slate-700 mb-4">
                                        Status Overview
                                    </h4>
                                    <ResponsiveContainer width="100%" height={280}>
                                        <BarChart data={comparisonData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                            <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} />
                                            <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
                                            <Tooltip 
                                                contentStyle={{
                                                    backgroundColor: 'white',
                                                    border: '1px solid #e2e8f0',
                                                    borderRadius: '8px',
                                                    padding: '8px 12px'
                                                }}
                                            />
                                            <Bar dataKey="value" radius={[8, 8, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>

                                {/* Reviewed Pie Chart */}
                                <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                                    <h4 className="font-semibold text-base text-slate-700 mb-4 flex items-center">
                                        <span className="w-3 h-3 bg-green-600 rounded-full mr-2"></span>
                                        Reviewed Registrations
                                    </h4>
                                    <ResponsiveContainer width="100%" height={240}>
                                        <PieChart>
                                            <Pie 
                                                data={reviewedData} 
                                                dataKey="value" 
                                                nameKey="name"
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={50} 
                                                outerRadius={80}
                                            >
                                                <Cell fill="#16a34a" />
                                            </Pie>
                                            <Tooltip 
                                                contentStyle={{
                                                    backgroundColor: 'white',
                                                    border: '1px solid #e2e8f0',
                                                    borderRadius: '8px',
                                                    padding: '8px 12px'
                                                }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div className="text-center mt-2">
                                        <p className="text-2xl font-bold text-green-600">{registrationStats.reviewed}</p>
                                        <p className="text-sm text-slate-600">Complete</p>
                                    </div>
                                </div>

                                {/* Unreviewed Pie Chart */}
                                <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                                    <h4 className="font-semibold text-base text-slate-700 mb-4 flex items-center">
                                        <span className="w-3 h-3 bg-red-600 rounded-full mr-2"></span>
                                        Unreviewed Registrations
                                    </h4>
                                    <ResponsiveContainer width="100%" height={240}>
                                        <PieChart>
                                            <Pie 
                                                data={unreviewedData} 
                                                dataKey="value" 
                                                nameKey="name"
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={50} 
                                                outerRadius={80}
                                            >
                                                <Cell fill="#dc2626" />
                                            </Pie>
                                            <Tooltip 
                                                contentStyle={{
                                                    backgroundColor: 'white',
                                                    border: '1px solid #e2e8f0',
                                                    borderRadius: '8px',
                                                    padding: '8px 12px'
                                                }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div className="text-center mt-2">
                                        <p className="text-2xl font-bold text-red-600">{registrationStats.unreviewed}</p>
                                        <p className="text-sm text-slate-600">Pending</p>
                                    </div>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-sm font-medium text-slate-700">Review Progress</p>
                                    <p className="text-sm font-semibold text-slate-900">{reviewedPercentage}% Complete</p>
                                </div>
                                <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                                    <div 
                                        className="bg-green-600 h-3 transition-all duration-500"
                                        style={{ width: `${reviewedPercentage}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* FOOTER INFO */}
            <footer className="text-center py-6">
                <p className="text-sm text-slate-500">
                    Dashboard last updated: {new Date().toLocaleString()}
                </p>
            </footer>
        </div>
      </div>
    );
};  

export default AdminHome;