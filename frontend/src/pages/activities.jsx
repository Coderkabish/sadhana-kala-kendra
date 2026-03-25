import { getAllActivities } from "../admin/services/activitiesService";
import React, { useEffect, useState, useRef } from "react";
import Seo from "../components/Seo";


// Define your YouTube channel URL here
const YOUTUBE_URL = "https://www.youtube.com/@sadhanakalakendra4620";

const PlayIcon = ({ className = "" }) => (
    <svg 
        className={`w-16 h-16 text-white opacity-90 transition-opacity duration-300 group-hover:opacity-100 ${className}`} 
        fill="currentColor" 
        viewBox="0 0 24 24"
    >
        <path d="M8 5v14l11-7z"/>
    </svg>
);

const ClickToPlayYouTube = ({ videoId, title, isPlaying, onPlay }) => {
    const iframeRef = useRef(null);
    const [isPaused, setIsPaused] = useState(false);

    useEffect(() => {
        if (!isPlaying) {
            setIsPaused(false);
        }
    }, [isPlaying]);

    const sendYouTubeCommand = (command) => {
        if (!iframeRef.current || !iframeRef.current.contentWindow) return;

        iframeRef.current.contentWindow.postMessage(
            JSON.stringify({
                event: "command",
                func: command,
                args: [],
            }),
            "*"
        );
    };

    if (!videoId) return null;

    if (isPlaying) {
        return (
            <div className="relative h-full w-full">
                <iframe
                    ref={iframeRef}
                    width="100%"
                    height="100%"
                    src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&playsinline=1&enablejsapi=1`}
                    title={title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                    allowFullScreen
                    className="rounded-lg w-full aspect-video pointer-events-none"
                ></iframe>

                <div className="absolute bottom-3 right-3 z-10 flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => {
                            if (isPaused) {
                                sendYouTubeCommand("playVideo");
                                setIsPaused(false);
                            } else {
                                sendYouTubeCommand("pauseVideo");
                                setIsPaused(true);
                            }
                        }}
                        className="rounded-full bg-white/95 px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-[#1f2a44] shadow-md"
                    >
                        {isPaused ? "Resume" : "Pause"}
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            sendYouTubeCommand("stopVideo");
                            setIsPaused(false);
                        }}
                        className="rounded-full bg-[#cf0408] px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-white shadow-md"
                    >
                        Stop
                    </button>
                </div>
            </div>
        );
    }

    return (
        <button
            type="button"
            onClick={onPlay}
            className="group relative h-full w-full overflow-hidden rounded-lg"
            aria-label={`Play ${title}`}
        >
            <img
                src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
                alt={`${title} thumbnail`}
                className="h-full w-full object-cover"
                loading="lazy"
            />
            <div className="absolute inset-0 bg-black/35 transition-colors duration-300 group-hover:bg-black/45" />
            <span className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-red-600 text-2xl text-white shadow-lg transition-transform duration-300 group-hover:scale-110">
                ▶
            </span>
        </button>
    );
};

const VideoCard = ({ videoPath, i }) => {
    const [isPausedAfterLoad, setIsPausedAfterLoad] = useState(false);
    const videoRef = useRef(null);
    const hasAttemptedPause = useRef(false);

    useEffect(() => {
        const videoElement = videoRef.current;
        if (videoElement && !hasAttemptedPause.current) {
            videoElement.muted = true;
            
            videoElement.play().then(() => {
                videoElement.pause();
                setIsPausedAfterLoad(true);
                hasAttemptedPause.current = true;
            }).catch(error => {
                console.error("Autoplay-and-pause failed:", error);
                // Fallback: If it fails, assume it's paused and show the play icon
                setIsPausedAfterLoad(true);
                hasAttemptedPause.current = true;
            });
        }
    }, [videoPath]); 

    // Removed the custom handleClick function.

    // Handlers to synchronize state with native controls
    const handleVideoPlay = () => {
        setIsPausedAfterLoad(false); // Hide custom icon when playing
    };

    const handleVideoPause = () => {
        setIsPausedAfterLoad(true);  // Show custom icon when paused
    };

    return (
        <div
            key={i}
            className="bg-white rounded-xl p-3 border border-gray-100 shadow-xl transition duration-500 hover:shadow-2xl hover:shadow-gray-300/60 hover:scale-[1.02] overflow-hidden group"
        >
            <div 
                // CRITICAL FIX: Removed onClick={handleClick} here. 
                // Clicks will now go directly to the <video> element.
                className="relative w-full aspect-video rounded-lg overflow-hidden bg-gray-200 shadow-md flex items-center justify-center cursor-pointer"
            >
                
                {isPausedAfterLoad && (
                    // The custom overlay is visible when the video is paused.
                    // pointer-events-none ensures the click passes through to the video element.
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 transition-opacity duration-300 bg-black/30 group-hover:bg-black/40"> 
                        <PlayIcon />
                    </div>
                )}

                <video
                    ref={videoRef}
                    title={`Sadhana Kala Kendra Video ${i + 1}`}
                    src={videoPath}
                    controls
                    className="w-full h-full object-cover"
                    loop
                    muted
                    playsInline
                    preload="metadata"
                    onPlay={handleVideoPlay}
                    onPause={handleVideoPause}
                ></video>
            </div>
        </div>
    );
}



const Activities = () => {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeVideoKey, setActiveVideoKey] = useState(null);

    useEffect(() => {
        window.scrollTo(0, 0);
        const fetchActivities = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await getAllActivities();
                setActivities(data || []);
            } catch (err) {
                setError("Failed to load activities.");
            } finally {
                setLoading(false);
            }
        };
        fetchActivities();
    }, []);

    // Helper to render YouTube or Facebook embed
    const renderVideoEmbed = (url, videoKey) => {
        if (!url) return null;
        // YouTube
        if (url.includes("youtube.com") || url.includes("youtu.be")) {
            let videoId = "";
            if (url.includes("youtu.be/")) {
                videoId = url.split("youtu.be/")[1].split(/[?&]/)[0];
            } else if (url.includes("/embed/")) {
                videoId = url.split("/embed/")[1].split(/[?&]/)[0];
            } else if (url.includes("/shorts/")) {
                videoId = url.split("/shorts/")[1].split(/[?&]/)[0];
            } else {
                const match = url.match(/[?&]v=([^&]+)/);
                videoId = match ? match[1] : "";
            }
            return (
                <ClickToPlayYouTube
                    videoId={videoId}
                    title="YouTube video player"
                    isPlaying={activeVideoKey === videoKey}
                    onPlay={() => setActiveVideoKey(videoKey)}
                />
            );
        }
        // Facebook
        if (url.includes("facebook.com")) {
            return (
                <iframe
                    src={`https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=0&width=560`}
                    width="100%"
                    height="315"
                    style={{ border: "none", overflow: "hidden" }}
                    scrolling="no"
                    frameBorder="0"
                    allowFullScreen={true}
                    allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                    className="rounded-lg w-full aspect-video"
                    title="Facebook video player"
                ></iframe>
            );
        }
        // Fallback: just a link
        return <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Watch Video</a>;
    };

    return (
        <section className="py-16 md:py-20 bg-gray-50 font-['Roboto'] ">
            <Seo
                title="Creative Activities and Video Showcases | Sadhana Kala Kendra"
                description="Watch creative activity videos from Sadhana Kala Kendra, including student showcases, class performances, and artistic highlights in music and dance training."
                keywords="Sadhana Kala Kendra activities, dance showcase videos, music performance videos, arts training highlights, creative student activities"
                canonicalPath="/activities"
            />
            <div className="text-center mb-16 max-w-5xl mx-auto">
                <h1 className="text-4xl md:text-5xl text-[#0f0f50] font-extrabold">
                    Creative <span className="text-[#cf0408]">Showcases</span> and Activities
                </h1>
                <p className="text-lg text-gray-600 max-w-4xl mx-auto font-['Roboto'] leading-relaxed font-medium">
                    Explore moments of creative expression from our classrooms, stages, and outdoor sessions. Every video highlights the joy and discipline of artistic learning at Sadhana Kala Kendra.
                </p>
            </div>

            <div className="max-w-7xl mx-auto mb-32">
                <h2 className="text-3xl font-bold text-gray-900 mb-16 text-center font-['Playfair Display'] relative inline-block mx-auto w-fit pb-2">
                    Featured Videos
                    <span className="absolute left-1/2 transform -translate-x-1/2 -bottom-2 w-16 h-1 bg-[#cf0408] rounded-full"></span>
                </h2>

                {loading ? (
                    <p className="text-center text-gray-500 text-lg py-12">Loading...</p>
                ) : error ? (
                    <p className="text-center text-red-500 text-lg py-12">{error}</p>
                ) : activities.length > 0 ? (
                    <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
                        {activities.map((activity, i) => (
                            <div key={activity.activity_id} className="bg-white rounded-xl p-3 border border-gray-100 shadow-xl transition duration-500 hover:shadow-2xl hover:shadow-gray-300/60 hover:scale-[1.02] overflow-hidden group">
                                <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-gray-200 shadow-md flex items-center justify-center cursor-pointer mb-4">
                                    {renderVideoEmbed(activity.video_url, activity.activity_id || i)}
                                </div>
                                <div className="p-2 text-center">
                                    <h3 className="text-lg font-bold text-[#0f0f50] mb-1 font-['Playfair Display']">{activity.title}</h3>
                                    {activity.description && <p className="text-gray-600 text-sm font-['Roboto']">{activity.description}</p>}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="col-span-full text-center text-gray-500 text-lg py-12 border-t border-gray-200 bg-white rounded-lg shadow-inner">No featured videos currently available. Please check back soon!</p>
                )}
            </div>

            <div className="text-center pt-16 border-t border-gray-200 bg-white/60 p-10 rounded-2xl shadow-inner">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4 font-['Inter']">
                    Dive Deeper into Our Artistry 
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10 font-['Roboto']">
                    Want to see more performances, behind-the-scenes moments, and student spotlights?
                </p>

                <a
                    href={YOUTUBE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center space-x-3 px-12 py-5 text-xl font-extrabold text-white bg-[#cf0408] rounded-full shadow-2xl shadow-red-500/50 hover:bg-red-700 transition duration-300"
                >
                    <svg
                        className="w-7 h-7"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path d="M12.0003 2.00008C6.48625 2.00008 2.00031 6.48594 2.00031 12.0001C2.00031 17.5142 6.48625 22.0001 12.0003 22.0001C17.5144 22.0001 22.0003 17.5142 22.0003 12.0001C22.0003 6.48594 17.5144 2.00008 12.0003 2.00008ZM16.8913 12.2851L10.3683 16.0351C10.2743 16.0891 10.1703 16.1151 10.0663 16.1151C9.97331 16.1151 9.87931 16.0911 9.78531 16.0461C9.59731 15.9551 9.47931 15.7661 9.47931 15.5561V8.44408C9.47931 8.23408 9.59731 8.04508 9.78531 7.95408C9.97331 7.86308 10.1983 7.88208 10.3683 7.97008L16.8913 11.7201C17.0673 11.8151 17.1523 11.9741 17.1523 12.1241C17.1523 12.2741 17.0673 12.4331 16.8913 12.5281V12.2851Z" />
                    </svg>
                    <span>Watch on YouTube</span>
                </a>
            </div>
        </section>
    );
};

export default Activities;