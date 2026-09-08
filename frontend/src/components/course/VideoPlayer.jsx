import { useEffect, useMemo, useRef, useState } from 'react';
import {
    FiPlay,
    FiPause,
    FiVolume2,
    FiVolumeX,
    FiMaximize,
    FiMinimize,
    FiRotateCcw,
    FiRotateCw
} from 'react-icons/fi';

const extractYouTubeId = (value) => {
    if (!value || typeof value !== 'string') return null;

    try {
        const parsed = new URL(value);
        const host = parsed.hostname.replace('www.', '');

        if (host === 'youtu.be') {
            return parsed.pathname.split('/')[1] || null;
        }

        if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
            if (parsed.pathname === '/watch') {
                return parsed.searchParams.get('v');
            }
            if (parsed.pathname.startsWith('/embed/')) {
                return parsed.pathname.split('/')[2] || null;
            }
            if (parsed.pathname.startsWith('/shorts/')) {
                return parsed.pathname.split('/')[2] || null;
            }
        }
    } catch {
        // Fall through to regex match.
    }

    const match = value.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/);
    return match ? match[1] : null;
};

const loadYouTubeApi = () => {
    if (window.YT && window.YT.Player) {
        return Promise.resolve(window.YT);
    }

    if (window.__ytApiPromise) {
        return window.__ytApiPromise;
    }

    window.__ytApiPromise = new Promise((resolve) => {
        const existing = document.getElementById('youtube-iframe-api');
        if (existing) {
            existing.addEventListener('load', () => resolve(window.YT));
            return;
        }

        const tag = document.createElement('script');
        tag.id = 'youtube-iframe-api';
        tag.src = 'https://www.youtube.com/iframe_api';
        window.onYouTubeIframeAPIReady = () => resolve(window.YT);
        document.body.appendChild(tag);
    });

    return window.__ytApiPromise;
};

const formatSeconds = (sec) => {
    if (!Number.isFinite(sec) || sec <= 0) return '0:00';
    const total = Math.floor(sec);
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
};

// Component for playing direct MP4 / WebM / local backend video files
const DirectHtml5Player = ({ src, onComplete }) => {
    const videoRef = useRef(null);
    const wrapperRef = useRef(null);
    const controlsTimeoutRef = useRef(null);
    const onCompleteRef = useRef(onComplete);
    const trackingRef = useRef({ maxWatched: 0, completed: false });

    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [playbackRate, setPlaybackRate] = useState(1);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        onCompleteRef.current = onComplete;
    }, [onComplete]);

    // Reset state on source change
    useEffect(() => {
        trackingRef.current = { maxWatched: 0, completed: false };
        setCurrentTime(0);
        setDuration(0);
        setIsPlaying(false);
        setIsLoading(true);
        setHasError(false);
    }, [src]);

    // Fullscreen change detection
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    const triggerControlsTimeout = () => {
        setShowControls(true);
        if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
        controlsTimeoutRef.current = setTimeout(() => {
            if (isPlaying) {
                setShowControls(false);
            }
        }, 2600);
    };

    const togglePlay = () => {
        if (!videoRef.current) return;
        if (videoRef.current.paused) {
            videoRef.current.play().catch(() => {});
        } else {
            videoRef.current.pause();
        }
    };

    const toggleMute = () => {
        if (!videoRef.current) return;
        const nextMuted = !isMuted;
        videoRef.current.muted = nextMuted;
        setIsMuted(nextMuted);
    };

    const handleVolumeChange = (e) => {
        const val = parseFloat(e.target.value);
        setVolume(val);
        if (videoRef.current) {
            videoRef.current.volume = val;
            const nextMuted = val === 0;
            videoRef.current.muted = nextMuted;
            setIsMuted(nextMuted);
        }
    };

    const handleSeek = (e) => {
        const time = parseFloat(e.target.value);
        if (videoRef.current) {
            videoRef.current.currentTime = time;
            setCurrentTime(time);
        }
    };

    const handleSkip = (seconds) => {
        if (!videoRef.current) return;
        const target = Math.max(0, Math.min(duration, videoRef.current.currentTime + seconds));
        videoRef.current.currentTime = target;
        setCurrentTime(target);
    };

    const handlePlaybackRate = () => {
        const rates = [1, 1.25, 1.5, 1.75, 2];
        const nextIdx = (rates.indexOf(playbackRate) + 1) % rates.length;
        const nextRate = rates[nextIdx];
        setPlaybackRate(nextRate);
        if (videoRef.current) {
            videoRef.current.playbackRate = nextRate;
        }
    };

    const toggleFullscreen = () => {
        if (!wrapperRef.current) return;
        if (!document.fullscreenElement) {
            wrapperRef.current.requestFullscreen().catch(() => {});
        } else {
            document.exitFullscreen().catch(() => {});
        }
    };

    const handleTimeUpdate = () => {
        if (!videoRef.current) return;
        const curr = videoRef.current.currentTime;
        const total = videoRef.current.duration;
        setCurrentTime(curr);

        if (Number.isFinite(total) && total > 0) {
            setDuration(total);
            const tracker = trackingRef.current;
            tracker.maxWatched = Math.max(tracker.maxWatched, curr);

            if (!tracker.completed && curr / total >= 0.95) {
                tracker.completed = true;
                onCompleteRef.current?.({
                    watchTime: Math.round(tracker.maxWatched),
                    duration: Math.round(total)
                });
            }
        }
    };

    const handleEnded = () => {
        setIsPlaying(false);
        const tracker = trackingRef.current;
        if (!tracker.completed && duration > 0) {
            tracker.completed = true;
            onCompleteRef.current?.({
                watchTime: Math.round(duration),
                duration: Math.round(duration)
            });
        }
    };

    const progressPercent = duration > 0 ? Math.min((currentTime / duration) * 100, 100) : 0;

    return (
        <div
            ref={wrapperRef}
            className="group relative w-full h-full bg-black flex items-center justify-center select-none overflow-hidden"
            onMouseMove={triggerControlsTimeout}
            onMouseLeave={() => isPlaying && setShowControls(false)}
        >
            <video
                ref={videoRef}
                src={src}
                className="w-full h-full object-contain cursor-pointer"
                onClick={togglePlay}
                onPlay={() => setIsPlaying(true)}
                onPause={() => {
                    setIsPlaying(false);
                    setShowControls(true);
                }}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={() => {
                    setIsLoading(false);
                    if (videoRef.current) {
                        setDuration(videoRef.current.duration || 0);
                    }
                }}
                onWaiting={() => setIsLoading(true)}
                onPlaying={() => setIsLoading(false)}
                onEnded={handleEnded}
                onError={() => {
                    setIsLoading(false);
                    setHasError(true);
                }}
                playsInline
                preload="metadata"
            />

            {/* Centered Large Play Button Overlay when paused */}
            {!isPlaying && !isLoading && !hasError && (
                <button
                    onClick={togglePlay}
                    aria-label="Play Video"
                    className="absolute z-20 w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-primary-600/90 text-white flex items-center justify-center shadow-2xl hover:scale-110 hover:bg-primary-500 transition duration-200"
                >
                    <FiPlay className="text-2xl sm:text-3xl ml-1" />
                </button>
            )}

            {/* Loading Spinner */}
            {isLoading && !hasError && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 pointer-events-none z-20">
                    <div className="w-12 h-12 border-4 border-white/20 border-t-primary-500 rounded-full animate-spin" />
                </div>
            )}

            {/* Error Message */}
            {hasError && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-20 p-4">
                    <div className="bg-red-950/80 border border-red-500/50 rounded-xl px-4 py-3 text-center text-white max-w-md">
                        <p className="font-semibold text-sm">Unable to load this video</p>
                        <p className="text-xs text-red-200 mt-1">Check your connection or video format</p>
                    </div>
                </div>
            )}

            {/* Control Bar Overlay */}
            <div
                className={`absolute inset-x-0 bottom-0 z-30 bg-gradient-to-t from-black/90 via-black/50 to-transparent px-3 sm:px-4 py-3 transition-opacity duration-300 ${
                    showControls || !isPlaying ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
            >
                {/* Progress bar scrubber */}
                <div className="relative flex items-center mb-2 group/slider">
                    <input
                        type="range"
                        min={0}
                        max={duration || 100}
                        step={0.1}
                        value={currentTime}
                        onChange={handleSeek}
                        aria-label="Seek Video"
                        className="w-full h-1.5 sm:h-2 bg-white/30 rounded-lg appearance-none cursor-pointer accent-primary-500 hover:h-2.5 transition-all"
                    />
                </div>

                <div className="flex items-center justify-between text-white text-xs sm:text-sm">
                    {/* Left Controls: Play, Skip, Volume, Time */}
                    <div className="flex items-center gap-2 sm:gap-3">
                        <button
                            onClick={togglePlay}
                            aria-label={isPlaying ? 'Pause' : 'Play'}
                            className="p-1.5 hover:text-primary-400 transition"
                        >
                            {isPlaying ? <FiPause size={18} /> : <FiPlay size={18} />}
                        </button>

                        <button
                            onClick={() => handleSkip(-10)}
                            aria-label="Rewind 10 seconds"
                            title="Rewind 10s"
                            className="p-1 hover:text-primary-400 transition hidden sm:inline-flex"
                        >
                            <FiRotateCcw size={16} />
                        </button>

                        <button
                            onClick={() => handleSkip(10)}
                            aria-label="Forward 10 seconds"
                            title="Forward 10s"
                            className="p-1 hover:text-primary-400 transition hidden sm:inline-flex"
                        >
                            <FiRotateCw size={16} />
                        </button>

                        <div className="flex items-center gap-1.5 group/vol">
                            <button
                                onClick={toggleMute}
                                aria-label={isMuted ? 'Unmute' : 'Mute'}
                                className="p-1 hover:text-primary-400 transition"
                            >
                                {isMuted || volume === 0 ? <FiVolumeX size={18} /> : <FiVolume2 size={18} />}
                            </button>
                            <input
                                type="range"
                                min={0}
                                max={1}
                                step={0.05}
                                value={isMuted ? 0 : volume}
                                onChange={handleVolumeChange}
                                aria-label="Volume"
                                className="w-12 sm:w-16 h-1 bg-white/30 rounded accent-primary-500 cursor-pointer hidden sm:block"
                            />
                        </div>

                        <span className="text-xs font-mono text-gray-300">
                            {formatSeconds(currentTime)} / {formatSeconds(duration)}
                        </span>
                    </div>

                    {/* Right Controls: Playback Speed & Fullscreen */}
                    <div className="flex items-center gap-2 sm:gap-3">
                        <button
                            onClick={handlePlaybackRate}
                            title="Playback Speed"
                            className="px-2 py-0.5 rounded text-xs font-semibold bg-white/10 hover:bg-white/20 transition"
                        >
                            {playbackRate}x
                        </button>

                        <button
                            onClick={toggleFullscreen}
                            aria-label={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
                            className="p-1 hover:text-primary-400 transition"
                        >
                            {isFullscreen ? <FiMinimize size={18} /> : <FiMaximize size={18} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Top Watch progress indicator */}
            <div className="absolute top-0 inset-x-0 h-1 bg-gray-800/80 z-20">
                <div
                    className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 transition-all duration-200"
                    style={{ width: `${progressPercent}%` }}
                />
            </div>
        </div>
    );
};

// YouTube API embed player component
const YouTubePlayer = ({ videoId, onComplete }) => {
    const playerRef = useRef(null);
    const containerRef = useRef(null);
    const onCompleteRef = useRef(onComplete);
    const trackingRef = useRef({
        maxWatched: 0,
        lastTime: 0,
        completed: false
    });

    useEffect(() => {
        onCompleteRef.current = onComplete;
    }, [onComplete]);

    const [isReady, setIsReady] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [playerError, setPlayerError] = useState('');

    useEffect(() => {
        trackingRef.current = { maxWatched: 0, lastTime: 0, completed: false };
        setCurrentTime(0);
        setDuration(0);
        setPlayerError('');

        if (!videoId || !containerRef.current) return;

        let isMounted = true;

        loadYouTubeApi().then((YT) => {
            if (!isMounted) return;

            if (playerRef.current) {
                try {
                    playerRef.current.destroy();
                } catch {
                    // Ignore destruction errors
                }
            }

            playerRef.current = new YT.Player(containerRef.current, {
                videoId,
                playerVars: {
                    autoplay: 0,
                    controls: 1,
                    modestbranding: 1,
                    playsinline: 1,
                    rel: 0,
                    iv_load_policy: 3,
                    origin: window.location.origin
                },
                events: {
                    onReady: (event) => {
                        if (!isMounted) return;
                        setIsReady(true);
                        const total = event.target.getDuration();
                        setDuration(Number.isFinite(total) ? total : 0);
                    },
                    onError: (event) => {
                        if (!isMounted) return;
                        const code = event?.data;
                        let message = 'This video cannot be played here.';

                        if (code === 2) {
                            message = 'Invalid YouTube URL or video ID.';
                        } else if (code === 5) {
                            message = 'The video player failed. Try a different link.';
                        } else if (code === 100) {
                            message = 'This video was removed or is private.';
                        } else if (code === 101 || code === 150) {
                            message = 'Embedding is disabled for this video. Use another link.';
                        }

                        setPlayerError(message);
                    },
                    onStateChange: (event) => {
                        if (!isMounted) return;

                        if (event.data === YT.PlayerState.ENDED) {
                            const total = event.target.getDuration();
                            const watchTime = Math.max(trackingRef.current.maxWatched, total);
                            if (!trackingRef.current.completed) {
                                trackingRef.current.completed = true;
                                onCompleteRef.current?.({
                                   watchTime: Math.round(watchTime),
                                   duration: Math.round(total || watchTime)
                                });
                            }
                        }
                    }
                }
            });
        });

        return () => {
            isMounted = false;
            if (playerRef.current) {
                try {
                    playerRef.current.destroy();
                } catch {
                    // Ignore
                }
                playerRef.current = null;
            }
        };
    }, [videoId]);

    // Track watch progress
    useEffect(() => {
        if (!isReady || !playerRef.current) return;

        const interval = setInterval(() => {
            const player = playerRef.current;
            if (!player || typeof player.getCurrentTime !== 'function') return;

            const time = player.getCurrentTime();
            const total = player.getDuration();
            if (Number.isFinite(total) && total > 0) {
                setDuration(total);
            }

            setCurrentTime(time);

            const tracker = trackingRef.current;
            tracker.maxWatched = Math.max(tracker.maxWatched, time);
            tracker.lastTime = time;

            if (!tracker.completed && total > 0 && time / total >= 0.95) {
                tracker.completed = true;
                onCompleteRef.current?.({
                    watchTime: Math.round(tracker.maxWatched),
                    duration: Math.round(total)
                });
            }
        }, 500);

        return () => clearInterval(interval);
    }, [isReady]);

    const progressPercent = duration > 0 ? Math.min((currentTime / duration) * 100, 100) : 0;

    return (
        <div className="video-player w-full relative">
            <div ref={containerRef} className="w-full h-full" />

            {playerError && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/85 z-20 p-4">
                    <div className="max-w-md text-center text-white bg-slate-900/95 border border-slate-700 p-6 rounded-2xl shadow-2xl">
                        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-xl font-bold">
                            !
                        </div>
                        <p className="font-semibold text-base mb-1">{playerError}</p>
                        <p className="text-xs text-slate-400 mb-4">You can watch this lesson directly on YouTube.</p>
                        <div className="flex flex-wrap items-center justify-center gap-2">
                            <a
                                href={`https://www.youtube.com/watch?v=${videoId}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold rounded-lg transition shadow-lg"
                            >
                                Watch on YouTube
                            </a>
                            <button
                                type="button"
                                onClick={() => onCompleteRef.current?.({ watchTime: 60, duration: 60 })}
                                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition shadow-lg"
                            >
                                Mark as Completed
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Watch progress bar */}
            <div className="w-full bg-gray-200 dark:bg-gray-700 h-1">
                <div
                    className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 transition-all"
                    style={{ width: `${progressPercent}%` }}
                />
            </div>
        </div>
    );
};

// Main Unified VideoPlayer: detects whether URL is YouTube or direct MP4/stream
const VideoPlayer = ({ url, onComplete }) => {
    const rawUrl = (url || '').trim();

    const videoId = useMemo(() => extractYouTubeId(rawUrl), [rawUrl]);

    // Resolve direct media URL (handles backend relative paths like /videos/...)
    const directMediaUrl = useMemo(() => {
        if (videoId) return null;
        if (!rawUrl) return null;

        if (rawUrl.startsWith('/videos/') || rawUrl.startsWith('/')) {
            const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
            // Extract backend origin (e.g. http://localhost:5000)
            const backendOrigin = apiBase.replace(/\/api\/?$/, '');
            return `${backendOrigin}${rawUrl}`;
        }
        return rawUrl;
    }, [rawUrl, videoId]);

    if (!rawUrl) {
        return (
            <div className="video-player w-full flex items-center justify-center text-white bg-slate-900">
                <p className="text-sm text-slate-400">No video URL provided</p>
            </div>
        );
    }

    if (videoId) {
        return <YouTubePlayer videoId={videoId} onComplete={onComplete} />;
    }

    if (directMediaUrl) {
        return <DirectHtml5Player src={directMediaUrl} onComplete={onComplete} />;
    }

    return (
        <div className="video-player w-full flex items-center justify-center text-white bg-slate-900">
            <p className="text-sm text-slate-400">Unsupported video format</p>
        </div>
    );
};

export default VideoPlayer;
