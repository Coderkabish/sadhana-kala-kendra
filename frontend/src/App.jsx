import React, { Suspense, lazy, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";

// ===== Components =====
import { Navbar } from "./components/navbar.jsx";
import { Footer } from "./components/footer.jsx";

// ===== User Pages =====
const Home = lazy(() => import("./pages/home.jsx"));
const About = lazy(() => import("./pages/about.jsx"));
const AboutProgramDetail = lazy(() => import("./pages/aboutProgramDetail.jsx"));
const AboutBodDetails = lazy(() => import("./pages/aboutBodDetails.jsx"));
const Courses = lazy(() => import("./pages/courses.jsx"));
const Activities = lazy(() => import("./pages/activities.jsx"));
const Events = lazy(() => import("./pages/events.jsx"));
const Offers = lazy(() => import("./pages/offers.jsx"));
const NewsDetail = lazy(() => import("./pages/newsDetails.jsx"));
const CourseDetail = lazy(() => import("./pages/courseDetail.jsx"));
const EventDetail = lazy(() => import("./pages/eventDetail.jsx"));
const ArtistDetail = lazy(() => import("./pages/artistDetail.jsx"));
const OfferDetail = lazy(() => import("./pages/offerDetail.jsx"));
const Gallery = lazy(() => import("./pages/gallary.jsx"));
const Artists = lazy(() => import("./pages/artists.jsx"));
const Teachers = lazy(() => import("./pages/teachers.jsx"));
const VisitorRegister = lazy(() => import("./pages/VisitorRegister.jsx"));
const NotFound = lazy(() => import("./pages/NotFound.jsx"));
// ===== Admin =====
const AdminRoutes = lazy(() => import("./admin/AdminRoutes"));

const RouteFallback = () => null;


const AppContent = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  useEffect(() => {
    // Keep page transitions consistent: always start at the top on route change.
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });

    // Signal prerenderer after route content has mounted.
    document.dispatchEvent(new Event("react-prerender-ready"));
  }, [location.pathname]);

  return (
    <div className="font-sans">
      {/* Only show Navbar and Footer for non-admin pages */}
      {!isAdminRoute && <Navbar />}

      <main className="min-h-screen bg-gray-50">
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            {/* User Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/about/bod/:slug" element={<AboutBodDetails />} />
            <Route path="/about/:slug" element={<AboutProgramDetail />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/activities" element={<Activities />} />
            <Route path="/events" element={<Events />} />
            <Route path="/offers" element={<Offers />} />
            <Route path="/news/:slug" element={<NewsDetail />} />
            <Route path="/courses/:slug" element={<CourseDetail />} />
            <Route path="/events/:slug" element={<EventDetail />} />
            <Route path="/artists/:slug" element={<ArtistDetail />} />
            <Route path="/offers/:slug" element={<OfferDetail />} />
            <Route path="/artists" element={<Artists />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/register" element={<VisitorRegister />} />
            <Route path="/teachers" element={<Teachers />} />

            {/* Admin Routes */}
            <Route path="/admin/*" element={<AdminRoutes />} />

            {/* Catch-all route for undefined pages (404) */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>

      {!isAdminRoute && <Footer />}
    </div>
  );
};

const App = () => (
  <Router>
    <AppContent />
  </Router>
);

export default App;