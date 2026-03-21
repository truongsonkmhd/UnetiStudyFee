import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Settings, Loader2, AlertTriangle } from 'lucide-react';
import { formatTime } from '@/utils/format';


interface VideoPlayerProps {
    videoId?: string;
    videoUrl?: string;
    onTimeUpdate?: (currentTime: number, duration: number) => void;
    onDurationReady?: (duration: number) => void;
    onEnded?: () => void;
    className?: string;
    autoPlay?: boolean;
    preventSeeking?: boolean;
    isCompleted?: boolean;
    initialTime?: number;
}

const extractYouTubeId = (url?: string): string | undefined => {
    if (!url) return undefined;
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})/);
    return match ? match[1] : undefined;
};

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
    onDurationReady,
    onEnded,
    className = '',
    autoPlay = true,
    preventSeeking = true,
    isCompleted = false,
    initialTime = 0,
}) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const playerRef = useRef<YTPlayer | null>(null);
    const timeUpdateInterval = useRef<NodeJS.Timeout | null>(null);
    const [apiLoaded, setApiLoaded] = useState(false);

    const onTimeUpdateRef = useRef(onTimeUpdate);
    const onDurationReadyRef = useRef(onDurationReady);
    const onEndedRef = useRef(onEnded);

    useEffect(() => {
        onTimeUpdateRef.current = onTimeUpdate;
        onDurationReadyRef.current = onDurationReady;
        onEndedRef.current = onEnded;
    }, [onTimeUpdate, onDurationReady, onEnded]);



    const [isPlaying, setIsPlaying] = useState(false);
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
    const [showWarning, setShowWarning] = useState(false);
    const maxTimeRef = useRef(0);
    const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const controlsTimeout = useRef<NodeJS.Timeout | null>(null);


    const actualVideoId = videoId || extractYouTubeId(videoUrl);
    const isYouTube = !!actualVideoId;
    const actualVideoUrl = isYouTube ? undefined : videoUrl;

    // Handle YouTube API Loading
    useEffect(() => {
        // Initialize maxTime tracking
        maxTimeRef.current = initialTime;

        if (actualVideoId) {
            if (window.YT && window.YT.Player) {
                setApiLoaded(true);
                return;
            }

            const existingScript = document.querySelector('script[src="https://www.youtube.com/iframe_api"]');

            const prevCallback = window.onYouTubeIframeAPIReady;
            window.onYouTubeIframeAPIReady = () => {
                if (prevCallback) prevCallback();
                setApiLoaded(true);
            };

            if (!existingScript) {
                const tag = document.createElement('script');
                tag.src = 'https://www.youtube.com/iframe_api';
                const firstScriptTag = document.getElementsByTagName('script')[0];
                if (firstScriptTag && firstScriptTag.parentNode) {
                    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
                } else {
                    document.head.appendChild(tag);
                }
            }
        }
    }, [actualVideoId, initialTime]);

    const startTimeTracking = useCallback(() => {
        if (timeUpdateInterval.current) return;

        timeUpdateInterval.current = setInterval(() => {
            if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
                const current = playerRef.current.getCurrentTime();
                const total = playerRef.current.getDuration();
                setCurrentTime(current);
                setDuration(total);

                // Track furthest point reached
                if (current > maxTimeRef.current) {
                    maxTimeRef.current = current;
                }

                // If time has elapsed, we consider it started
                if (current > 0.1) setHasStarted(true);

                if (onTimeUpdateRef.current) {
                    onTimeUpdateRef.current(current, total);
                }
            }
        }, 500);
    }, []);

    const stopTimeTracking = useCallback(() => {
        if (timeUpdateInterval.current) {
            clearInterval(timeUpdateInterval.current);
            timeUpdateInterval.current = null;
        }
    }, []);

    // Initialize YouTube Player
    useEffect(() => {
        if (apiLoaded && actualVideoId && containerRef.current && !playerRef.current) {
            playerRef.current = new window.YT.Player(containerRef.current, {
                height: '100%',
                width: '100%',
                videoId: actualVideoId,
                playerVars: {
                    autoplay: autoPlay ? 1 : 0,
                    controls: 0,
                    disablekb: 1,
                    fs: 0,
                    modestbranding: 1,
                    rel: 0,
                    showinfo: 0,
                    iv_load_policy: 3,
                    enablejsapi: 1,
                    origin: window.location.origin,
                    widget_referrer: window.location.origin,
                },
                host: 'https://www.youtube.com',
                events: {
                    onReady: (event: { target: YTPlayer }) => {
                        const dur = event.target.getDuration();
                        setDuration(dur);
                        if (onDurationReadyRef.current) onDurationReadyRef.current(dur);
                        if (initialTime > 0) {
                            event.target.seekTo(initialTime, true);
                        }
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
                            if (onEndedRef.current) onEndedRef.current();
                        }
                    },
                    onError: (event: { data: number }) => {
                        console.error('YouTube Player Error:', event.data);
                        // 2: The request contains an invalid parameter value.
                        // 5: The requested content cannot be played in an HTML5 player or another error related to the HTML5 player has occurred.
                        // 100: The video requested was not found.
                        // 101, 150: The owner of the requested video does not allow it to be played in embedded players.
                        setIsBuffering(false);
                        setApiLoaded(false); // Force reload or show error UI if desired
                    }
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
    }, [apiLoaded, actualVideoId, autoPlay, startTimeTracking, stopTimeTracking]);

    // Native Video Events
    const handleLoadedMetadata = () => {
        if (videoRef.current) {
            const dur = videoRef.current.duration;
            setDuration(dur);
            if (onDurationReadyRef.current) onDurationReadyRef.current(dur);
            if (initialTime > 0) {
                videoRef.current.currentTime = initialTime;
            }
        }
    };

    const handleNativeTimeUpdate = () => {
        if (videoRef.current) {
            const current = videoRef.current.currentTime;
            const total = videoRef.current.duration;
            setCurrentTime(current);

            if (current > maxTimeRef.current) {
                maxTimeRef.current = current;
            }

            if (current > 0.1) setHasStarted(true);
            if (onTimeUpdateRef.current) {
                onTimeUpdateRef.current(current, total);
            }
        }
    };

    const handleNativeWaiting = () => setIsBuffering(true);
    const handleNativePlaying = () => {
        setIsBuffering(false);
        setHasStarted(true);
        setIsPlaying(true);
    };

    const handleNativeEnded = () => {
        setIsPlaying(false);
        if (onEndedRef.current) onEndedRef.current();
    };

    // Toggle Play/Pause
    const togglePlay = (e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        setShowSettings(false);

        if (isYouTube && playerRef.current) {
            if (isPlaying) {
                playerRef.current.pauseVideo();
            } else {
                setIsBuffering(true);
                playerRef.current.playVideo();
                setHasStarted(true);
            }
        } else if (!isYouTube && videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
                setIsPlaying(false);
            } else {
                setIsBuffering(true);
                void videoRef.current.play();
                setHasStarted(true);
            }
        }
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const time = parseFloat(e.target.value);

        if (preventSeeking && !isCompleted && time > maxTimeRef.current + 2) {
            if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
            setShowWarning(true);
            warningTimeoutRef.current = setTimeout(() => setShowWarning(false), 3000);
            return;
        }

        if (isYouTube && playerRef.current) {
            playerRef.current.seekTo(time, true);
        } else if (!isYouTube && videoRef.current) {
            videoRef.current.currentTime = time;
        }
        setCurrentTime(time);
        if (time > 0) setHasStarted(true);
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseFloat(e.target.value);
        setVolume(val);
        setIsMuted(val === 0);
        if (isYouTube && playerRef.current) {
            playerRef.current.setVolume(val * 100);
        } else if (!isYouTube && videoRef.current) {
            videoRef.current.volume = val;
        }
    };

    const toggleMute = () => {
        const newMute = !isMuted;
        setIsMuted(newMute);
        if (isYouTube && playerRef.current) {
            if (newMute) playerRef.current.mute();
            else playerRef.current.unMute();
        } else if (!isYouTube && videoRef.current) {
            videoRef.current.muted = newMute;
        }
    };

    const handleSpeedChange = (rate: number) => {
        setPlaybackRate(rate);
        setShowSettings(false);
        if (isYouTube && playerRef.current) {
            playerRef.current.setPlaybackRate(rate);
        } else if (!isYouTube && videoRef.current) {
            videoRef.current.playbackRate = rate;
        }
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
            <div className={`w-full h-full transition-opacity duration-1000 ${hasStarted ? 'opacity-100' : 'opacity-0'}`}>
                {isYouTube ? (
                    <div ref={containerRef} className="w-full h-full pointer-events-none" />
                ) : actualVideoUrl ? (
                    <video
                        ref={videoRef}
                        src={actualVideoUrl}
                        className="w-full h-full object-cover"
                        onTimeUpdate={handleNativeTimeUpdate}
                        onEnded={handleNativeEnded}
                        onLoadedMetadata={handleLoadedMetadata}
                        onWaiting={handleNativeWaiting}
                        onPlaying={handleNativePlaying}
                        onPause={() => setIsPlaying(false)}
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
                  ${!isPlaying || !hasStarted ? 'bg-black/80' : 'bg-transparent'}`}
                onClick={togglePlay}
            >
                {/* Buffering Indicator */}
                {isBuffering && (
                    <div className="absolute inset-0 flex items-center justify-center z-20">
                        <Loader2 size={48} className="text-primary animate-spin" />
                    </div>
                )}

                {/* Large Center Play Button - covers initial title and paused "More videos" shelf */}
                {(!isPlaying || !hasStarted) && !isBuffering && (
                    <div className="absolute inset-x-0 top-0 bottom-24 flex items-center justify-center flex-col gap-5 animate-in fade-in zoom-in duration-500 pointer-events-none">
                        <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center text-white scale-100 hover:scale-110 transition-transform border-[6px] border-white/20">
                            <Play size={44} fill="currentColor" className="ml-1.5" />
                        </div>
                        <span className="text-white font-extrabold text-xl tracking-widest opacity-90 uppercase drop-shadow-lg">
                            {hasStarted ? 'Tiếp tục học' : 'Bắt đầu học ngay'}
                        </span>
                    </div>
                )}
            </div>

            {/* Seek Warning Overlay */}
            {showWarning && (
                <div className="absolute inset-x-0 top-1/4 z-50 flex justify-center pointer-events-none px-6 animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="bg-destructive/90 text-white px-8 py-4 rounded-2xl flex items-center gap-4 border border-white/20 transform scale-100 animate-in zoom-in-95 duration-200">
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                            <AlertTriangle size={28} className="text-white" />
                        </div>
                        <div>
                            <h4 className="font-bold text-lg leading-tight">Cảnh báo</h4>
                            <p className="text-sm opacity-90">Bạn không được phép tua nhanh video này khi chưa xem hết!</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Premium Controls UI */}
            <div className={`absolute inset-0 z-20 transition-opacity duration-300 flex flex-col justify-end pointer-events-none ${showControls ? 'opacity-100' : 'opacity-0'}`}>

                {showSettings && (
                    <div className="absolute right-8 bottom-28 w-48 bg-black/90 border border-white/10 rounded-2xl p-2 z-30 pointer-events-auto settings-menu animate-in slide-in-from-bottom-5 duration-200">
                        <div className="px-3 py-2 text-xs font-bold text-white/40 uppercase tracking-widest border-b border-white/5 mb-1">
                            Tốc độ phát
                        </div>
                        {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                            <button
                                key={rate}
                                onClick={(e) => { e.stopPropagation(); handleSpeedChange(rate); }}
                                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${playbackRate === rate ? 'bg-primary text-white' : 'text-white/70 hover:bg-white/5'}`}
                            >
                                <span>{rate === 1 ? 'Bình thường' : `${rate}x`}</span>
                                {playbackRate === rate && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                            </button>
                        ))}
                    </div>
                )}

                <div className={`bg-gradient-to-t from-black/95 via-black/80 to-transparent px-8 py-6 transition-all duration-300 ${showControls ? 'pointer-events-auto' : 'pointer-events-none delay-200'}`}>
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
