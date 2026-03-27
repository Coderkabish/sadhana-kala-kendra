import React, { useState, useEffect } from "react";
import { SERVER_ROOT_URL } from "../admin/services/api";
import { getAllGalleryItems } from "../admin/services/galleryService";
import Seo from "../components/Seo";
import PageLoader from "../components/PageLoader";
import EmptyState from "../components/EmptyState";

// --- Configuration ---
const FACEBOOK_URL = "https://www.facebook.com/sadhanakalakendranepal";
// Define a utility to get the icon (using a simple path for the Facebook logo)
const FacebookIcon = (props) => (
    <svg {...props} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2ZM15.4243 12.7153H13.125V19.5H10.125V12.7153H8.5V10.2153H10.125V8.5C10.125 7.4249 10.4278 6.6749 11.9703 6.6749H13.361V9.0153H12.1875C11.5178 9.0153 11.25 9.3878 11.25 10.0343V10.2153H13.4118L13.125 12.7153H15.4243Z" />
    </svg>
);


const Gallery = () => {
    const [selectedMedia, setSelectedMedia] = useState(null);
    const [photos, setPhotos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        window.scrollTo(0, 0);

        const fetchGallery = async () => {
            try {
                setLoading(true);
                const items = await getAllGalleryItems();
                setPhotos(Array.isArray(items) ? items : []);
            } catch (err) {
                setError("Failed to load gallery images.");
            } finally {
                setLoading(false);
            }
        };

        fetchGallery();
    }, []);

    // Escape key handler for closing the modal (Good UX)
    useEffect(() => {
        const handleEscape = (event) => {
            if (event.key === 'Escape') {
                setSelectedMedia(null);
            }
        };

        if (selectedMedia) {
            document.addEventListener('keydown', handleEscape);
        } else {
            document.removeEventListener('keydown', handleEscape);
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
        };
    }, [selectedMedia]);
    
    // Helper function to get the title
    const getPhotoTitle = (photo, index) => photo.title || `Gallery Photo ${index + 1}`;


    return (
        <section className="py-16 md:py-20 bg-gray-50">
            <Seo
                title="Photo Gallery | Sadhana Kala Kendra Performances and Activities"
                description="View the Sadhana Kala Kendra gallery featuring student performances, classroom moments, events, and cultural highlights across music and dance programs."
                keywords="Sadhana Kala Kendra gallery, music school photos, dance performance gallery, cultural event images, arts academy Nepal"
                canonicalPath="/gallery"
            />
            {/* Section Header */}
            <div className="text-center mb-12 md:mb-16 max-w-3xl mx-auto px-4">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#0f0f50] mb-4 font-['Inter']">
                    Our <span className="text-red-600">Gallery</span>
                </h2>
                <p className="text-base sm:text-lg md:text-xl text-gray-600 font-['Roboto']">
                    Explore our memorable moments through photos. {/* Updated text */}
                </p>
            </div>

            {/* Photo Gallery */}
            <div className="max-w-7xl mx-auto mb-16 px-4">
                
                {loading ? (
                    <PageLoader message="Loading gallery content..." />
                ) : error ? (
                    <div className="text-center py-10 text-xl text-red-600">{error}</div>
                ) : photos.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                        {photos.map((photo, index) => (
                            <div
                                key={photo.media_id || `photo-${index}`}
                                className="overflow-hidden rounded-2xl shadow-xl bg-white group cursor-pointer transform hover:scale-[1.02] transition-all duration-300 relative"
                                onClick={() => setSelectedMedia({ type: "image", src: `${SERVER_ROOT_URL}${photo.image_url}`, title: getPhotoTitle(photo, index) })}
                            >
                                <img
                                    src={`${SERVER_ROOT_URL}${photo.image_url}`}
                                    alt={getPhotoTitle(photo, index)}
                                    loading="lazy"
                                    className="w-full h-48 sm:h-56 md:h-64 object-cover transition-opacity duration-300 group-hover:opacity-85"
                                />
                                <div className="p-3 absolute inset-0 bg-red bg-opacity-30 flex items-end opacity-10 group-hover:opacity-100 transition-opacity">
                                    <p className="text-white font-medium text-lg truncate w-full">{getPhotoTitle(photo, index)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <EmptyState
                        title="No Gallery Photos Found"
                        description="Please check back soon for new photo uploads."
                    />
                )}
            </div>

    

            
            {/* ===== CALL TO ACTION & FACEBOOK LINK LAYOUT (Kept as requested) ===== */}
            <div className="text-center mt-24 max-w-7xl mx-auto px-4">
                <h2 className="text-3xl md:text-4xl font-bold text-[#191938]  mb-4 font-['Inter']">
        Be Part of the Experience
    </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8 font-['Roboto']">
        Want to see more performances, behind-the-scenes moments, and student spotlights?
    </p>
    <a 
        href={FACEBOOK_URL} 
        target="_blank" 
        rel="noopener noreferrer" 
                        className="inline-flex items-center justify-center space-x-3 px-12 py-5 text-xl font-extrabold text-white bg-blue-600 rounded-full shadow-2xl shadow-blue-500/50 hover:bg-blue-700 transition duration-300"
    >
        <FacebookIcon className="w-7 h-7"
        viewBox="0 0 24 24"
                        fill="currentColor"
                        xmlns="http://www.w3.org/2000/svg" />
        <span>Visit Facebook Page</span>
    </a>
    
</div>

            {/* Lightbox Modal (Now Image Only) */}
            {selectedMedia && (
                <div
                    className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    onClick={() => setSelectedMedia(null)}
                >
                    <div className="relative max-w-full max-h-full" onClick={(e) => e.stopPropagation()}>
                        {/* Close Button */}
                        <button 
                            className="absolute top-4 right-4 text-white text-3xl font-light p-2 w-10 h-10 flex items-center justify-center bg-red-600/80 rounded-full hover:bg-red-600 transition z-10 shadow-lg"
                            onClick={() => setSelectedMedia(null)}
                            aria-label="Close image viewer"
                        >
                            &times;
                        </button>

                        {/* Renders image only, since selectedMedia is only set for type="image" */}
                        <img
                            src={selectedMedia.src}
                            alt={selectedMedia.title || "Preview"}
                            loading="lazy"
                            className="max-h-[85vh] max-w-[90vw] rounded-2xl shadow-2xl object-contain"
                        />
                        
                        {/* Title Display */}
                        {selectedMedia.title && (
                               <p className="mt-4 text-white text-lg font-semibold text-center truncate max-w-[90vw] px-4">
                                   {selectedMedia.title}
                                </p>
                        )}
                    </div>
                </div>
            )}
        </section>
    );
};

export default Gallery;