import { useRef, useEffect } from 'react';

const VideoPlayer = ({ url, onComplete }) => {
    const videoRef = useRef(null);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const handleEnded = () => {
            if (onComplete) {
                onComplete();
            }
        };

        video.addEventListener('ended', handleEnded);

        return () => {
            video.removeEventListener('ended', handleEnded);
        };
    }, [onComplete]);

    return (
        <div className="video-player w-full">
            <video
                ref={videoRef}
                controls
                controlsList="nodownload"
                className="w-full h-full rounded-lg"
                src={url}
            >
                Your browser does not support the video tag.
            </video>
        </div>
    );
};

export default VideoPlayer;