import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import AdminLayout from "../admin/AdminLayout";
import AdminHome from "../admin/components/ui/AdminHome";
import AdminAbout from "../admin/pages/AdminAbout";
import AdminCourses from "../admin/pages/AdminCourses";
import AdminArtists from "../admin/pages/AdminArtists";
import AdminEvents from "../admin/pages/AdminEvents";
import AdminActivities from "../admin/pages/AdminActivities";
import AdminTeachers from "../admin/pages/AdminTeachers";
import AdminRegister from "../admin/pages/AdminRegister";
import AdminNews from "../admin/pages/AdminNews";
import AdminOffers from "../admin/pages/AdminOffers";
import api, { setUnauthorizedRedirectCallback } from "../admin/services/api";

const AdminLogin = React.lazy(() => import("../admin/pages/AdminLogin"));

const AdminRoutes = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [adminUsername, setAdminUsername] = useState("");

    // Register the 401 redirect callback
    useEffect(() => {
        setUnauthorizedRedirectCallback(() => {
            setIsAuthenticated(false);
            setAdminUsername("");
            navigate("/admin/login", { replace: true });
        });
    }, [navigate]);

    // Validate session on component mount
    useEffect(() => {
        const validateSession = async () => {
            try {
                const response = await api.get("/admin/me");
                
                // ✅ CRITICAL FIX: Verify response has valid data
                if (response.data && response.data.valid && response.data.username) {
                    setIsAuthenticated(true);
                    setAdminUsername(response.data.username);
                } else {
                    // Backend responded but without valid session data
                    setIsAuthenticated(false);
                    setAdminUsername("");
                }
            } catch (error) {
                // Any error means not authenticated
                console.log("Session validation failed:", error.message);
                setIsAuthenticated(false);
                setAdminUsername("");
            } finally {
                setLoading(false);
            }
        };

        validateSession();
    }, []);

    const handleLoginSuccess = async () => {
        try {
            const response = await api.get("/admin/me");
            if (response.data && response.data.valid && response.data.username) {
                setAdminUsername(response.data.username);
                setIsAuthenticated(true);
                navigate("/admin", { replace: true });
            }
        } catch (error) {
            console.error("Failed to fetch admin info after login:", error);
        }
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
        setAdminUsername("");
        navigate("/admin/login", { replace: true });
    };

    const ProtectedRoute = ({ element }) => {
        if (loading) {
            return (
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-lg">Loading...</div>
                </div>
            );
        }
        
        if (!isAuthenticated) {
            return <Navigate to="/admin/login" replace />;
        }
        
        return element;
    };

    return (
        <Routes>
            <Route
                path="login"
                element={
                    loading ? (
                        <div className="flex items-center justify-center min-h-screen">
                            <div className="text-lg">Loading...</div>
                        </div>
                    ) : isAuthenticated ? (
                        <Navigate to="/admin" replace />
                    ) : (
                        <AdminLogin onLoginSuccess={handleLoginSuccess} />
                    )
                }
            />

            <Route element={<AdminLayout onLogout={handleLogout} adminUsername={adminUsername} />}>
                <Route path="/" element={<ProtectedRoute element={<AdminHome />} />} />
                <Route path="about" element={<ProtectedRoute element={<AdminAbout />} />} />
                <Route path="courses" element={<ProtectedRoute element={<AdminCourses />} />} />
                <Route path="activities" element={<ProtectedRoute element={<AdminActivities />} />} />
                <Route path="artists" element={<ProtectedRoute element={<AdminArtists />} />} />
                <Route path="events" element={<ProtectedRoute element={<AdminEvents />} />} />
                <Route path="news" element={<ProtectedRoute element={<AdminNews />} />} />
                <Route path="offers" element={<ProtectedRoute element={<AdminOffers />} />} />
                <Route path="teachers" element={<ProtectedRoute element={<AdminTeachers />} />} />
                <Route path="register" element={<ProtectedRoute element={<AdminRegister />} />} />

                <Route
                    path="*"
                    element={<Navigate to="/admin" replace />}
                />
            </Route>
        </Routes>
    );
};

export default AdminRoutes;