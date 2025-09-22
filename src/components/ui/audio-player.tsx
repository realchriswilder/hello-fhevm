import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Minimize2, Maximize2, Move } from 'lucide-react';
import { Button } from './button';

interface AudioPlayerProps {
  src: string;
  className?: string;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ src, className = '' }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const audioRef = useRef<HTMLAudioElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  // Drag functionality
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;
      
      // Keep within viewport bounds
      const maxX = window.innerWidth - (playerRef.current?.offsetWidth || 320);
      const maxY = window.innerHeight - (playerRef.current?.offsetHeight || 200);
      
      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY))
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newTime = parseFloat(e.target.value);
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newVolume = parseFloat(e.target.value);
    audio.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleDragStart = (e: React.MouseEvent) => {
    // Don't start dragging if clicking on interactive elements
    const target = e.target as HTMLElement;
    if (target.closest('input[type="range"]') || 
        target.closest('button') || 
        target.closest('.slider')) {
      return;
    }
    
    if (!playerRef.current) return;
    
    const rect = playerRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    setIsDragging(true);
  };

  return (
    <div 
      className={`fixed z-50 ${className}`}
      style={{
        left: position.x || 'auto',
        top: position.y || 'auto',
        right: position.x === 0 ? '6rem' : 'auto',
        bottom: position.y === 0 ? '1.5rem' : 'auto',
        cursor: isDragging ? 'grabbing' : 'grab'
      }}
      ref={playerRef}
    >
        <div 
          className={`bg-background/95 backdrop-blur-sm border border-border rounded-2xl shadow-2xl transition-all duration-300 ${
            isCollapsed ? 'p-0 w-64 h-12' : 'p-4 w-80 max-w-[calc(100vw-2rem)] sm:w-80'
          }`}
        >
        <audio ref={audioRef} src={src} preload="metadata" />
        
        {/* Header */}
        {!isCollapsed && (
          <div 
            className="flex items-center justify-between mb-3 cursor-grab"
            onMouseDown={handleDragStart}
          >
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-foreground">Audio Guide</span>
            </div>
            
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMute}
                className="h-8 w-8 p-0"
              >
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="h-8 w-8 p-0"
                title="Collapse player"
              >
                <Minimize2 className="h-4 w-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 cursor-grab"
                title="Drag to move"
                onMouseDown={handleDragStart}
              >
                <Move className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {!isCollapsed && (
          <>
            {/* Wave Animation */}
            <div className="flex items-center justify-center mb-4">
              <div className="flex items-end gap-0.5 sm:gap-1 h-6 sm:h-8">
                {[...Array(20)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-0.5 sm:w-1 bg-gradient-to-t from-primary to-primary/60 rounded-full transition-all duration-300 ${
                      isPlaying ? 'animate-pulse' : ''
                    }`}
                    style={{
                      height: isPlaying 
                        ? `${Math.random() * 100 + 20}%` 
                        : '20%',
                      animationDelay: `${i * 50}ms`,
                      animationDuration: `${Math.random() * 200 + 300}ms`
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-3">
              <input
                type="range"
                min="0"
                max={duration || 0}
                value={currentTime}
                onChange={handleSeek}
                onMouseDown={(e) => e.stopPropagation()}
                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, hsl(var(--primary)) 0%, hsl(var(--primary)) ${(currentTime / duration) * 100}%, hsl(var(--muted)) ${(currentTime / duration) * 100}%, hsl(var(--muted)) 100%)`
                }}
              />
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-3">
                <Button
                  onClick={togglePlayPause}
                  className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-primary hover:bg-primary/90 transition-all duration-200 hover:scale-105"
                >
                  {isPlaying ? (
                    <Pause className="h-4 w-4 sm:h-5 sm:w-5" />
                  ) : (
                    <Play className="h-4 w-4 sm:h-5 sm:w-5 ml-0.5" />
                  )}
                </Button>
                
                <div className="text-xs text-muted-foreground hidden sm:block">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </div>
              </div>

              <div className="flex items-center gap-1 sm:gap-2">
                <Volume2 className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  onMouseDown={(e) => e.stopPropagation()}
                  className="w-12 sm:w-16 h-1 bg-muted rounded-lg appearance-none cursor-pointer slider"
                />
              </div>
            </div>

            {/* Mobile Time Display */}
            <div className="mt-2 text-center sm:hidden">
              <div className="text-xs text-muted-foreground">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
            </div>

            {/* Title */}
            <div className="mt-3 text-center">
              <p className="text-xs text-muted-foreground">
                FHEVM Tutorial Complete Guide
              </p>
            </div>
          </>
        )}

        {/* Collapsed State - Horizontal Rectangle with Wave */}
        {isCollapsed && (
          <div 
            className="flex items-center justify-between px-3 py-2 h-full cursor-grab"
            onMouseDown={handleDragStart}
          >
            {/* Play/Pause Button */}
            <Button
              onClick={togglePlayPause}
              className="h-8 w-8 rounded-full bg-primary hover:bg-primary/90 transition-all duration-200 hover:scale-105 flex-shrink-0"
            >
              {isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4 ml-0.5" />
              )}
            </Button>

            {/* Wave Animation Line */}
            <div className="flex-1 mx-3">
              <div className="flex items-center justify-center h-4">
                <div className="flex items-end gap-0.5 h-4 w-full max-w-32">
                  {[...Array(12)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-0.5 bg-gradient-to-t from-primary to-primary/60 rounded-full transition-all duration-300 ${
                        isPlaying ? 'animate-pulse' : ''
                      }`}
                      style={{
                        height: isPlaying 
                          ? `${Math.random() * 100 + 20}%` 
                          : '20%',
                        animationDelay: `${i * 80}ms`,
                        animationDuration: `${Math.random() * 300 + 400}ms`
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Time Display */}
            <div className="text-xs text-muted-foreground flex-shrink-0 min-w-0 mr-2">
              {formatTime(currentTime)}
            </div>

            {/* Controls */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsCollapsed(false)}
                className="h-6 w-6 p-0"
                title="Expand player"
              >
                <Maximize2 className="h-3 w-3" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 cursor-grab"
                title="Drag to move"
                onMouseDown={handleDragStart}
              >
                <Move className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: hsl(var(--primary));
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        
        .slider::-moz-range-thumb {
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: hsl(var(--primary));
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </div>
  );
};
