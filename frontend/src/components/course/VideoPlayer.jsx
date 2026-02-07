import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

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
    } catch (error) {
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

const VideoPlayer = ({ url, onComplete }) => {
    const playerRef = useRef(null);
    const containerRef = useRef(null);
    const onCompleteRef = useRef(onComplete);
    const trackingRef = useRef({
        maxWatched: 0,
        lastTime: 0,
        completed: false
    });

    // Keep the ref up to date without triggering effects
    useEffect(() => {
        onCompleteRef.current = onComplete;
    }, [onComplete]);

    const [isReady, setIsReady] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [playerError, setPlayerError] = useState('');

    const videoId = useMemo(() => extractYouTubeId(url), [url]);

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
                playerRef.current.destroy();
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
                playerRef.current.destroy();
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

    if (!videoId) {
        return (
            <div className="video-player w-full flex items-center justify-center text-white">
                <p>Invalid YouTube URL</p>
            </div>
        );
    }

    return (
        <div className="video-player w-full relative">
            <div ref={containerRef} className="w-full h-full" />

            {playerError && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="max-w-sm text-center text-white text-sm bg-black/70 px-4 py-3 rounded-lg">
                        {playerError}
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

export default VideoPlayer;
