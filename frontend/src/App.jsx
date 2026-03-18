import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";

// ===== Components =====
import { Navbar } from "./components/navbar.jsx";
import { Footer } from "./components/footer.jsx";

// ===== User Pages =====
import Home from "./pages/home.jsx";
import About from "./pages/about.jsx";
import Courses from "./pages/courses.jsx";
import Activities from "./pages/activities.jsx";
import Events from "./pages/events.jsx";
import Offers from "./pages/offers.jsx";
import NewsDetail from "./pages/newsDetails.jsx";
import CourseDetail from "./pages/courseDetail.jsx";
import EventDetail from "./pages/eventDetail.jsx";
import ArtistDetail from "./pages/artistDetail.jsx";
import OfferDetail from "./pages/offerDetail.jsx";
import Gallery from "./pages/gallary.jsx";
import Artists from "./pages/artists.jsx";
import Teachers from "./pages/teachers.jsx";
import VisitorRegister from "./pages/VisitorRegister.jsx";
// ===== Admin =====
import AdminRoutes from "./admin/AdminRoutes";


const AppContent = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <div className="font-sans">
      {/* Only show Navbar and Footer for non-admin pages */}
      {!isAdminRoute && <Navbar />}

      <main className="min-h-screen bg-gray-50">
        <Routes>
          {/* User Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
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
        </Routes>
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