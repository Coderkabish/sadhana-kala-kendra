import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { getAllArtists } from "../admin/services/artistsService";
import { SERVER_ROOT_URL } from "../admin/services/api";
import Seo from "../components/Seo";

const Artists = () => {
    const [artistsList, setArtistsList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchArtists = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getAllArtists();
            setArtistsList(data);
            setError(null);
        } catch (err) {
            console.error("Failed to fetch artists:", err);
            setError("Failed to load artists. Please check connection.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        window.scrollTo(0, 0);
        fetchArtists();
    }, [fetchArtists]);

    const seoProps = {
        title: "Featured Artists and Alumni | Sadhana Kala Kendra",
        description:
            "Discover featured artists and alumni of Sadhana Kala Kendra, showcasing performance journeys, creative achievements, and training rooted in Nepali arts.",
        keywords:
            "Sadhana Kala Kendra artists, music school alumni, featured performers Nepal, artist profiles, performing arts alumni",
        canonicalPath: "/artists",
    };

      if (loading) {
    return (
            <>
                <Seo {...seoProps} />
                <div className="min-h-screen flex items-center justify-center bg-white">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#cf0408] mx-auto mb-4"></div>
                        <p className="text-xl text-[#191938] font-['Inter']">
                            Loading artists content...
                        </p>
                    </div>
        </div>
            </>
    );
  }

    if (error) {
        return (
                        <>
                                <Seo {...seoProps} />
                                <section className="py-20 bg-gray-50 min-h-screen">
                                        <div className="text-center text-xl text-red-600">{error}</div>
                                </section>
                        </>
        );
    }

    return (
        <section className="py-20 bg-gray-50">
                        <Seo {...seoProps} />
            <div className="max-w-7xl mx-auto px-6 lg:px-12">

                {/* ===== PAGE HEADER ===== */}
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-extrabold text-[#0f0f50] mb-4 font-['Inter']">
                        Pride of{" "}
                        <span className="text-red-600 font-['Playfair_Display']">
                            Sadhana Kala Kendra
                        </span>
                    </h2>
                    <p className="text-gray-600 text-lg md:text-xl font-['Roboto']">
                        Celebrating the talented artists who began their journey with us.
                    </p>
                </div>

                {/* ===== ARTISTS GRID ===== */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {artistsList.length > 0 ? (
                        artistsList.map((artist) => (
                            <div
                                key={artist.artist_id}
                                className="bg-white border border-gray-200 p-0 rounded-2xl shadow-xl hover:shadow-2xl transition duration-300 transform hover:-translate-y-1 overflow-hidden text-left"
                            >
                                {/* IMAGE */}
                                <div className="h-64 overflow-hidden">
                                    <img
                                        src={
                                            artist.profile_image
                                                ? `${SERVER_ROOT_URL}${artist.profile_image}`
                                                : "placeholder.jpg"
                                        }
                                        alt={artist.full_name}
                                        className="w-full aspect-[4/3] object-cover object-top transition-transform duration-500 hover:scale-105"
                                    />
                                </div>

                                {/* CONTENT */}
                                <div className="p-6">
                                    <h3 className="text-2xl font-bold mb-1 text-[#0f0f50] text-center font-['Inter']">
                                        {artist.full_name}
                                    </h3>

                                    {artist.stage_name && (
                                        <p className="text-red-600 font-semibold mb-4 font-['Roboto']">
                                            {artist.stage_name}
                                        </p>
                                    )}

                                    <p className="text-gray-700 mb-4 font-['Roboto'] text-center line-clamp-3">
                                        {artist.bio}
                                    </p>
                                                                        {artist.slug ? (
                                                                            <div className="text-center">
                                                                                <Link to={`/artists/${artist.slug}`} className="text-indigo-700 font-semibold hover:text-indigo-900">
                                                                                    View Profile Route
                                                                                </Link>
                                                                            </div>
                                                                        ) : null}
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="col-span-full text-center text-gray-500 text-lg p-8 bg-yellow-50 rounded-lg font-['Roboto']">
                            No artists are currently featured !
                        </p>
                    )}
                </div>
            </div>
        </section>
    );
};

export default Artists;