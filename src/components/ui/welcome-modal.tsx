import React, { useState, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Minimize2, Maximize2, Move, Gauge, ExternalLink, Youtube, X } from 'lucide-react';
import { Button } from './button';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEnterTutorial: () => void;
  audioSrc: string;
  videoId: string;
  videoTitle?: string;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({
  isOpen,
  onClose,
  onEnterTutorial,
  audioSrc,
  videoId,
  videoTitle = "FHEVM Tutorial Complete Guide"
}) => {
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [audioMuted, setAudioMuted] = useState(false);
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [audioVolume, setAudioVolume] = useState(1);
  const [audioPlaybackRate, setAudioPlaybackRate] = useState(1);
  const audioRef = React.useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setAudioCurrentTime(audio.currentTime);
    const updateDuration = () => setAudioDuration(audio.duration);
    const handleEnded = () => setAudioPlaying(false);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  const toggleAudioPlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audioPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setAudioPlaying(!audioPlaying);
  };

  const toggleAudioMute = () => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.muted = !audioMuted;
    setAudioMuted(!audioMuted);
  };

  const handleAudioSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newTime = parseFloat(e.target.value);
    audio.currentTime = newTime;
    setAudioCurrentTime(newTime);
  };

  const handleAudioVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newVolume = parseFloat(e.target.value);
    audio.volume = newVolume;
    setAudioVolume(newVolume);
    setAudioMuted(newVolume === 0);
  };

  const handleAudioPlaybackRateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newRate = parseFloat(e.target.value);
    audio.playbackRate = newRate;
    setAudioPlaybackRate(newRate);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getYouTubeEmbedUrl = () => {
    const baseUrl = `https://www.youtube.com/embed/${videoId}`;
    const params = new URLSearchParams({
      autoplay: videoPlaying ? '1' : '0',
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

  const openInYouTube = () => {
    window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-2 sm:p-4">
      <div className="relative w-full max-w-7xl bg-background/95 backdrop-blur-sm border border-border rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[95vh] overflow-y-auto">
        {/* Close Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 h-8 w-8 p-0 bg-background/80 hover:bg-background"
        >
          <X className="h-4 w-4" />
        </Button>

        <div className="p-4 sm:p-6 lg:p-8">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-3 sm:mb-4">
              Welcome to FHEVM Tutorial
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto px-2">
              Learn Fully Homomorphic Encryption on Ethereum with our comprehensive guide. 
              Choose your preferred learning method below or explore both!
            </p>
          </div>

          {/* Media Players Container */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8">
            {/* Audio Player - Left Side */}
            <div className="relative w-full transform lg:-rotate-2 lg:translate-x-2 transition-transform duration-500 hover:scale-105">
              <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-border/50 w-full h-full min-h-[300px] sm:min-h-[400px] flex flex-col shadow-xl">
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-foreground">Audio Guide</span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={toggleAudioMute}
                      className="h-8 w-8 p-0"
                    >
                      {audioMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                
                <audio ref={audioRef} src={audioSrc} preload="metadata" />
                
                {/* Wave Animation */}
                <div className="flex items-center justify-center mb-3 sm:mb-4 flex-1">
                  <div className="flex items-end gap-1 sm:gap-1.5 h-16 sm:h-20 lg:h-28 w-full max-w-md sm:max-w-lg lg:max-w-2xl">
                    {[...Array(36)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-1 sm:w-1 bg-gradient-to-t from-primary to-primary/60 rounded-full transition-all duration-300 ${
                          audioPlaying ? 'animate-pulse' : ''
                        }`}
                        style={{
                          height: audioPlaying 
                            ? `${Math.random() * 100 + 20}%` 
                            : '20%',
                          animationDelay: `${i * 35}ms`,
                          animationDuration: `${Math.random() * 250 + 350}ms`
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
                    max={audioDuration || 0}
                    value={audioCurrentTime}
                    onChange={handleAudioSeek}
                    className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer slider"
                    style={{
                      background: `linear-gradient(to right, hsl(var(--primary)) 0%, hsl(var(--primary)) ${(audioCurrentTime / audioDuration) * 100}%, hsl(var(--muted)) ${(audioCurrentTime / audioDuration) * 100}%, hsl(var(--muted)) 100%)`
                    }}
                  />
                </div>

                {/* Controls */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Button
                      onClick={toggleAudioPlayPause}
                      className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-primary hover:bg-primary/90 transition-all duration-200 hover:scale-105"
                    >
                      {audioPlaying ? (
                        <Pause className="h-4 w-4 sm:h-5 sm:w-5" />
                      ) : (
                        <Play className="h-4 w-4 sm:h-5 sm:w-5 ml-0.5" />
                      )}
                    </Button>
                    
                    <div className="text-xs text-muted-foreground hidden sm:block flex items-center gap-1">
                      <span>{formatTime(audioCurrentTime)} / {formatTime(audioDuration)}</span>
                      <span className="text-primary font-medium">{audioPlaybackRate}x</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="flex items-center gap-1 sm:gap-2">
                      <Volume2 className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={audioMuted ? 0 : audioVolume}
                        onChange={handleAudioVolumeChange}
                        className="w-12 sm:w-16 h-1 bg-muted rounded-lg appearance-none cursor-pointer slider"
                      />
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Gauge className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                      <select
                        value={audioPlaybackRate}
                        onChange={handleAudioPlaybackRateChange}
                        className="text-xs bg-background border border-border rounded px-1 py-0.5 cursor-pointer"
                      >
                        <option value={0.8}>0.8x</option>
                        <option value={0.9}>0.9x</option>
                        <option value={1.0}>1.0x</option>
                        <option value={1.1}>1.1x</option>
                        <option value={1.2}>1.2x</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Mobile Time Display */}
                <div className="mt-2 text-center sm:hidden">
                  <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                    <span>{formatTime(audioCurrentTime)} / {formatTime(audioDuration)}</span>
                    <span className="text-primary font-medium">{audioPlaybackRate}x</span>
                  </div>
                </div>

                {/* Title */}
                <div className="mt-auto text-center">
                  <p className="text-xs text-muted-foreground">
                    FHEVM Tutorial Complete Guide
                  </p>
                </div>
              </div>
            </div>

            {/* Video Player - Right Side */}
            <div className="relative w-full transform lg:rotate-2 lg:-translate-x-2 transition-transform duration-500 hover:scale-105">
              <div className="bg-gradient-to-br from-red-500/10 to-orange-500/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-border/50 w-full h-full min-h-[300px] sm:min-h-[400px] flex flex-col shadow-xl">
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-foreground">Video Guide</span>
                  </div>
                </div>
                
                {/* YouTube Video */}
                <div className="relative w-full aspect-video rounded-lg overflow-hidden mb-3 sm:mb-4 flex-1">
                  <iframe
                    src={getYouTubeEmbedUrl()}
                    title={videoTitle}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>

                {/* Video Controls */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Button
                      onClick={() => setVideoPlaying(!videoPlaying)}
                      className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-red-600 hover:bg-red-700 transition-all duration-200 hover:scale-105"
                    >
                      {videoPlaying ? (
                        <Pause className="h-4 w-4 sm:h-5 sm:w-5" />
                      ) : (
                        <Play className="h-4 w-4 sm:h-5 sm:w-5 ml-0.5" />
                      )}
                    </Button>
                    
                    <span className="text-xs sm:text-sm text-foreground">
                      {videoTitle}
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

                {/* Title */}
                <div className="mt-auto text-center">
                  <p className="text-xs text-muted-foreground">
                    Watch the complete tutorial
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="text-center">
            <Button
              onClick={onEnterTutorial}
              size="lg"
              className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground px-6 sm:px-8 py-3 text-base sm:text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 w-full sm:w-auto"
            >
              🚀 ENTER TUTORIAL
            </Button>
            <p className="mt-3 text-xs sm:text-sm text-muted-foreground">
              Start your FHEVM learning journey
            </p>
          </div>
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
    </div>
  );
};
