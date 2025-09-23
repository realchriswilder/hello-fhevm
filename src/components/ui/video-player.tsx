import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Minimize2, Maximize2, Move, ExternalLink, Youtube } from 'lucide-react';
import { Button } from './button';

interface VideoPlayerProps {
  videoId: string;
  title?: string;
  className?: string;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ 
  videoId, 
  title = "FHEVM Tutorial Video",
  className = '' 
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const playerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const isTouchDraggingRef = useRef(false);

  // Drag functionality (mouse + touch)
  useEffect(() => {
    const updatePosition = (clientX: number, clientY: number) => {
      const newX = clientX - dragOffset.x;
      const newY = clientY - dragOffset.y;

      const maxX = window.innerWidth - (playerRef.current?.offsetWidth || 400);
      const maxY = window.innerHeight - (playerRef.current?.offsetHeight || 300);

      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY))
      });
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      updatePosition(e.clientX, e.clientY);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      isTouchDraggingRef.current = false;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging || !isTouchDraggingRef.current) return;
      if (e.touches.length !== 1) return;
      const t = e.touches[0];
      updatePosition(t.clientX, t.clientY);
      e.preventDefault();
    };

    const handleTouchEnd = () => {
      setIsDragging(false);
      isTouchDraggingRef.current = false;
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
      document.addEventListener('touchcancel', handleTouchEnd);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove as any);
      document.removeEventListener('touchend', handleTouchEnd as any);
      document.removeEventListener('touchcancel', handleTouchEnd as any);
    };
  }, [isDragging, dragOffset]);

  const togglePlayPause = () => {
    if (isCollapsed) {
      setIsCollapsed(false);
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const openInYouTube = () => {
    window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank');
  };

  const handleDragStart = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('iframe')) {
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

  const handleTouchDragStart = (e: React.TouchEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('iframe')) {
      return;
    }
    if (!playerRef.current || e.touches.length !== 1) return;
    const t = e.touches[0];
    const rect = playerRef.current.getBoundingClientRect();
    setDragOffset({ x: t.clientX - rect.left, y: t.clientY - rect.top });
    setIsDragging(true);
    isTouchDraggingRef.current = true;
  };

  const getYouTubeEmbedUrl = () => {
    const baseUrl = `https://www.youtube.com/embed/${videoId}`;
    const params = new URLSearchParams({
      autoplay: isPlaying ? '1' : '0',
      controls: '1',
      modestbranding: '1',
      rel: '0',
      showinfo: '0',
      fs: '1',
      cc_load_policy: '0',
      iv_load_policy: '3',
      autohide: '0'
    });
    return `${baseUrl}?${params.toString()}`;
  };

  return (
    <div 
      className={`fixed z-50 ${className}`}
      style={{
        left: position.x || 'auto',
        top: position.y || 'auto',
        right: position.x === 0 ? '1rem' : 'auto',
        bottom: position.y === 0 ? '6rem' : 'auto',
        cursor: isDragging ? 'grabbing' : 'grab'
      }}
      ref={playerRef}
    >
      <div 
        className={`bg-background/95 backdrop-blur-sm border border-border rounded-2xl shadow-2xl transition-all duration-300 ${
          isCollapsed ? 'p-0 w-80 h-12' : 'p-4 w-96 max-w-[calc(100vw-2rem)] sm:w-96'
        }`}
      >
        {/* Header */}
        {!isCollapsed && (
          <div 
            className="flex items-center justify-between mb-3 cursor-grab"
            onMouseDown={handleDragStart}
            onTouchStart={handleTouchDragStart}
            style={{ touchAction: 'none' }}
          >
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-foreground">Video Guide</span>
            </div>
            
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={openInYouTube}
                className="h-8 w-8 p-0"
                title="Open in YouTube"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsCollapsed(true)}
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
                onTouchStart={handleTouchDragStart}
                style={{ touchAction: 'none' }}
              >
                <Move className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {!isCollapsed && (
          <>
            {/* YouTube Video */}
            <div className="relative w-full aspect-video rounded-lg overflow-hidden mb-3">
              <iframe
                ref={iframeRef}
                src={getYouTubeEmbedUrl()}
                title={title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  onClick={togglePlayPause}
                  className="h-8 w-8 rounded-full bg-primary hover:bg-primary/90 transition-all duration-200 hover:scale-105"
                >
                  {isPlaying ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4 ml-0.5" />
                  )}
                </Button>
                
                <span className="text-sm text-muted-foreground">
                  {title}
                </span>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={openInYouTube}
                className="h-8 px-3 text-xs"
              >
                <Youtube className="h-3 w-3 mr-1" />
                Open in YouTube
              </Button>
            </div>
          </>
        )}

        {/* Collapsed State - Horizontal Rectangle */}
        {isCollapsed && (
          <div 
            className="flex items-center justify-between px-3 py-2 h-full cursor-grab"
            onMouseDown={handleDragStart}
            onTouchStart={handleTouchDragStart}
            style={{ touchAction: 'none' }}
          >
            {/* Play/Expand Button */}
            <Button
              onClick={togglePlayPause}
              className="h-8 w-8 rounded-full bg-red-600 hover:bg-red-700 transition-all duration-200 hover:scale-105 flex-shrink-0"
            >
              <Play className="h-4 w-4 ml-0.5" />
            </Button>

            {/* Video Thumbnail Preview */}
            <div className="flex-1 mx-3 flex items-center gap-2">
              <div className="w-8 h-6 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center flex-shrink-0">
                <Youtube className="h-4 w-4 text-red-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-foreground truncate">
                  {title}
                </p>
                <p className="text-xs text-muted-foreground">
                  Click to expand video
                </p>
              </div>
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
                onTouchStart={handleTouchDragStart}
                style={{ touchAction: 'none' }}
              >
                <Move className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
