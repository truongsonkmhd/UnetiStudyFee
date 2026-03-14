import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Settings, Loader2 } from 'lucide-react';


interface VideoPlayerProps {
    videoId?: string;
    videoUrl?: string;         // Direct video URL (e.g., .mp4)
    onTimeUpdate?: (currentTime: number, duration: number) => void;
    onEnded?: () => void;
    className?: string;
    autoPlay?: boolean;
}

interface YTPlayer {
    destroy: () => void;
    playVideo: () => void;
    pauseVideo: () => void;
    seekTo: (seconds: number, allowSeekAhead: boolean) => void;
    setVolume: (volume: number) => void;
    mute: () => void;
    unMute: () => void;
    getCurrentTime: () => number;
    getDuration: () => number;
    setPlaybackRate: (suggestedRate: number) => void;
    getPlaybackRate: () => number;
}

declare global {
    interface Window {
        onYouTubeIframeAPIReady: () => void;
        YT: {
            Player: new (element: HTMLElement | string, options: unknown) => YTPlayer;
        };
    }
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
    videoId,
    videoUrl,
    onTimeUpdate,
    onEnded,
    className = '',
    autoPlay = true,
}) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const playerRef = useRef<YTPlayer | null>(null);
    const timeUpdateInterval = useRef<NodeJS.Timeout | null>(null);
    const [apiLoaded, setApiLoaded] = useState(false);

    // Custom States
    const [isPlaying, setIsPlaying] = useState(autoPlay);
    const [isBuffering, setIsBuffering] = useState(false);
    const [hasStarted, setHasStarted] = useState(false);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [volume, setVolume] = useState(1);
    const [playbackRate, setPlaybackRate] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const [showSettings, setShowSettings] = useState(false);
    const controlsTimeout = useRef<NodeJS.Timeout | null>(null);

    // Handle YouTube API Loading
    useEffect(() => {
        if (videoId && !window.YT) {
            const tag = document.createElement('script');
            tag.src = 'https://www.youtube.com/iframe_api';
            const firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

            window.onYouTubeIframeAPIReady = () => {
                setApiLoaded(true);
            };
        } else if (videoId && window.YT) {
            setApiLoaded(true);
        }
    }, [videoId]);

    const startTimeTracking = useCallback(() => {
        if (timeUpdateInterval.current) return;

        timeUpdateInterval.current = setInterval(() => {
            if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
                const current = playerRef.current.getCurrentTime();
                const total = playerRef.current.getDuration();
                setCurrentTime(current);
                setDuration(total);

                // If time has elapsed, we consider it started
                if (current > 0.1) setHasStarted(true);

                if (onTimeUpdate) {
                    onTimeUpdate(current, total);
                }
            }
        }, 500);
    }, [onTimeUpdate]);

    const stopTimeTracking = useCallback(() => {
        if (timeUpdateInterval.current) {
            clearInterval(timeUpdateInterval.current);
            timeUpdateInterval.current = null;
        }
    }, []);

    // Initialize YouTube Player
    useEffect(() => {
        if (apiLoaded && videoId && containerRef.current && !playerRef.current) {
            playerRef.current = new window.YT.Player(containerRef.current, {
                height: '100%',
                width: '100%',
                videoId: videoId,
                playerVars: {
                    autoplay: autoPlay ? 1 : 0,
                    controls: 0,
                    disablekb: 1,
                    fs: 0,
                    modestbranding: 1,
                    rel: 0,
                    showinfo: 0,
                    iv_load_policy: 3,
                    widget_referrer: window.location.origin,
                },
                events: {
                    onReady: (event: { target: YTPlayer }) => {
                        setDuration(event.target.getDuration());
                        if (autoPlay) {
                            event.target.playVideo();
                        }
                    },
                    onStateChange: (event: { data: number }) => {
                        // YT.PlayerState.PLAYING = 1
                        if (event.data === 1) {
                            setIsPlaying(true);
                            setIsBuffering(false);
                            setHasStarted(true);
                            startTimeTracking();
                        } else if (event.data === 3) { // BUFFERING
                            setIsBuffering(true);
                        } else if (event.data === 2) { // PAUSED
                            setIsPlaying(false);
                            setIsBuffering(false);
                            stopTimeTracking();
                        } else if (event.data === 0) { // ENDED
                            setIsPlaying(false);
                            setIsBuffering(false);
                            stopTimeTracking();
                            if (onEnded) onEnded();
                        }
                    },
                },
            });
        }

        return () => {
            stopTimeTracking();
            if (playerRef.current) {
                playerRef.current.destroy();
                playerRef.current = null;
            }
        };
    }, [apiLoaded, videoId, autoPlay, onEnded, startTimeTracking, stopTimeTracking]);

    // Native Video Events
    const handleLoadedMetadata = () => {
        if (videoRef.current) {
            setDuration(videoRef.current.duration);
        }
    };

    const handleNativeTimeUpdate = () => {
        if (videoRef.current) {
            setCurrentTime(videoRef.current.currentTime);
            if (videoRef.current.currentTime > 0.1) setHasStarted(true);
            if (onTimeUpdate) {
                onTimeUpdate(videoRef.current.currentTime, videoRef.current.duration);
            }
        }
    };

    const handleNativeWaiting = () => setIsBuffering(true);
    const handleNativePlaying = () => {
        setIsBuffering(false);
        setHasStarted(true);
    };

    const handleNativeEnded = () => {
        setIsPlaying(false);
        if (onEnded) onEnded();
    };

    // Toggle Play/Pause
    const togglePlay = () => {
        setShowSettings(false);
        if (videoId && playerRef.current) {
            if (isPlaying) {
                playerRef.current.pauseVideo();
            } else {
                playerRef.current.playVideo();
                setHasStarted(true);
            }
        } else if (videoUrl && videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                void videoRef.current.play();
                setHasStarted(true);
            }
        }
    };

    // Handle Seek
    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const time = parseFloat(e.target.value);
        if (videoId && playerRef.current) {
            playerRef.current.seekTo(time, true);
        } else if (videoUrl && videoRef.current) {
            videoRef.current.currentTime = time;
        }
        setCurrentTime(time);
        if (time > 0) setHasStarted(true);
    };

    // Handle Volume
    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseFloat(e.target.value);
        setVolume(val);
        setIsMuted(val === 0);
        if (videoId && playerRef.current) {
            playerRef.current.setVolume(val * 100);
        } else if (videoUrl && videoRef.current) {
            videoRef.current.volume = val;
        }
    };

    const toggleMute = () => {
        const newMute = !isMuted;
        setIsMuted(newMute);
        if (videoId && playerRef.current) {
            if (newMute) playerRef.current.mute();
            else playerRef.current.unMute();
        } else if (videoUrl && videoRef.current) {
            videoRef.current.muted = newMute;
        }
    };

    // Handle Speed
    const handleSpeedChange = (rate: number) => {
        setPlaybackRate(rate);
        setShowSettings(false);
        if (videoId && playerRef.current) {
            playerRef.current.setPlaybackRate(rate);
        } else if (videoUrl && videoRef.current) {
            videoRef.current.playbackRate = rate;
        }
    };

    // Format Time
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Toggle Fullscreen
    const toggleFullscreen = () => {
        const container = document.getElementById('video-container');
        if (!container) return;

        if (!isFullscreen) {
            if (container.requestFullscreen) {
                void container.requestFullscreen();
            }
        } else {
            if (document.exitFullscreen) {
                void document.exitFullscreen();
            }
        }
    };

    useEffect(() => {
        const handleFsChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFsChange);
        return () => document.removeEventListener('fullscreenchange', handleFsChange);
    }, []);

    // Idle Detection
    const handleMouseMove = () => {
        setShowControls(true);
        if (controlsTimeout.current) clearTimeout(controlsTimeout.current);
        controlsTimeout.current = setTimeout(() => {
            if (isPlaying && !showSettings) setShowControls(false);
        }, 3000);
    };

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (showSettings && !(e.target as HTMLElement).closest('.settings-menu')) {
                setShowSettings(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showSettings]);

    // Progress percentage for range styling
    const progressPercent = (currentTime / (duration || 1)) * 100;

    return (
        <div
            id="video-container"
            className={`aspect-video w-full bg-black overflow-hidden relative group select-none ${className}`}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => isPlaying && !showSettings && setShowControls(false)}
        >
            {/* Player Engine */}
            <div className={`w-full h-full pointer-events-none transition-opacity duration-1000 ${hasStarted ? 'opacity-100' : 'opacity-0'}`}>
                {videoId ? (
                    <div ref={containerRef} className="w-full h-full" />
                ) : videoUrl ? (
                    <video
                        ref={videoRef}
                        src={videoUrl}
                        className="w-full h-full object-cover"
                        onTimeUpdate={handleNativeTimeUpdate}
                        onEnded={handleNativeEnded}
                        onLoadedMetadata={handleLoadedMetadata}
                        onWaiting={handleNativeWaiting}
                        onPlaying={handleNativePlaying}
                        playsInline
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        No video content available
                    </div>
                )}
            </div>

            {/* Smart Overlay Mask & Initial State */}
            <div
                className={`absolute inset-0 z-10 cursor-pointer transition-all duration-700 
                  ${!isPlaying || !hasStarted ? 'bg-black/80 backdrop-blur-md' : 'bg-transparent pointer-events-none'}`}
                onClick={togglePlay}
            >
                {/* Buffering Indicator */}
                {isBuffering && isPlaying && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Loader2 size={48} className="text-primary animate-spin" />
                    </div>
                )}

                {/* Large Center Play Button - covers initial title and paused "More videos" shelf */}
                {(!isPlaying || !hasStarted) && !isBuffering && (
                    <div className="absolute inset-x-0 top-0 bottom-24 flex items-center justify-center flex-col gap-5 animate-in fade-in zoom-in duration-500">
                        <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center text-white shadow-[0_0_60px_rgba(var(--primary-rgb),0.4)] scale-100 hover:scale-110 transition-transform border-[6px] border-white/20">
                            <Play size={44} fill="currentColor" className="ml-1.5" />
                        </div>
                        <span className="text-white font-extrabold text-xl tracking-widest opacity-90 uppercase drop-shadow-lg">
                            {hasStarted ? 'Tiếp tục học' : 'Bắt đầu học ngay'}
                        </span>
                    </div>
                )}
            </div>

            {/* Premium Controls UI */}
            <div className={`absolute inset-0 z-20 transition-opacity duration-300 flex flex-col justify-end pointer-events-none ${showControls ? 'opacity-100' : 'opacity-0'}`}>

                {/* Custom Settings Popover */}
                {showSettings && (
                    <div className="absolute right-8 bottom-28 w-48 bg-black/90 backdrop-blur-xl border border-white/10 rounded-2xl p-2 z-30 pointer-events-auto settings-menu animate-in slide-in-from-bottom-5 duration-200">
                        <div className="px-3 py-2 text-xs font-bold text-white/40 uppercase tracking-widest border-b border-white/5 mb-1">
                            Tốc độ phát
                        </div>
                        {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                            <button
                                key={rate}
                                onClick={() => handleSpeedChange(rate)}
                                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${playbackRate === rate ? 'bg-primary text-white shadow-lg' : 'text-white/70 hover:bg-white/5'}`}
                            >
                                <span>{rate === 1 ? 'Bình thường' : `${rate}x`}</span>
                                {playbackRate === rate && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                            </button>
                        ))}
                    </div>
                )}

                {/* Bottom Bar Container */}
                <div className="bg-gradient-to-t from-black/95 via-black/80 to-transparent px-8 py-6 pointer-events-auto">
                    {/* Progress Slider - Refined Aligment with custom styles */}
                    <div className="mb-6 relative group/slider flex items-center h-4">
                        <input
                            type="range"
                            min="0"
                            max={duration || 100}
                            step="0.01"
                            value={currentTime}
                            onChange={handleSeek}
                            className="video-progress-slider w-full h-1.5 rounded-full appearance-none cursor-pointer accent-primary group-hover/slider:h-2 transition-all outline-none"
                            style={{
                                background: `linear-gradient(to right, hsl(var(--primary)) 0%, hsl(var(--primary)) ${progressPercent}%, rgba(255, 255, 255, 0.1) ${progressPercent}%, rgba(255, 255, 255, 0.1) 100%)`
                            }}
                        />
                    </div>

                    <div className="flex items-center justify-between text-white">
                        <div className="flex items-center gap-8">
                            <button onClick={togglePlay} className="hover:text-primary transition-all active:scale-90 outline-none">
                                {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
                            </button>

                            <div className="flex items-center gap-3 group/volume">
                                <button onClick={toggleMute} className="hover:text-primary transition-all outline-none">
                                    {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
                                </button>
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.05"
                                    value={volume}
                                    onChange={handleVolumeChange}
                                    className="w-0 group-hover/volume:w-24 transition-all overflow-hidden h-1 appearance-none bg-white/10 rounded-full accent-white cursor-pointer outline-none"
                                />
                            </div>

                            <span className="text-sm font-bold tabular-nums opacity-90 tracking-widest min-w-[120px]">
                                {formatTime(currentTime)} <span className="opacity-30 mx-2 text-xs font-normal">|</span> {formatTime(duration)}
                            </span>
                        </div>

                        <div className="flex items-center gap-6">
                            <button
                                onClick={(e) => { e.stopPropagation(); setShowSettings(!showSettings); }}
                                className={`hover:text-primary transition-all active:rotate-45 outline-none ${showSettings ? 'text-primary' : 'opacity-60 hover:opacity-100'}`}
                            >
                                <Settings size={22} className={showSettings ? 'animate-spin-slow' : ''} />
                            </button>
                            <button onClick={toggleFullscreen} className="hover:text-primary transition-all opacity-60 hover:opacity-100 outline-none">
                                <Maximize size={24} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Global Styled Components */}
            <style dangerouslySetInnerHTML={{
                __html: `
                .video-progress-slider::-webkit-slider-thumb {
                    appearance: none;
                    width: 14px;
                    height: 14px;
                    background: white;
                    border-radius: 50%;
                    cursor: pointer;
                    box-shadow: 0 0 15px rgba(0,0,0,0.5);
                    transform: scale(0);
                    transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    border: 2px solid hsl(var(--primary));
                    margin-top: -1px;
                }
                .group\\/slider:hover .video-progress-slider::-webkit-slider-thumb {
                    transform: scale(1);
                }
                .animate-spin-slow {
                    animation: spin 3s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                #video-container iframe {
                    width: 100% !important;
                    height: 100% !important;
                    object-fit: cover;
                }
            ` }} />
        </div>
    );
};

export default VideoPlayer;
