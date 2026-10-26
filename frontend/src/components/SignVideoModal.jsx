import React, { useState, useRef, useEffect, useCallback } from 'react';
import { SIGN_CLASSES, getVideoUrl } from '../data/classes';
import { speakText } from '../utils/speech';
import {
  IconX,
  IconPlay,
  IconPause,
  IconRotateCcw,
  IconVolume,
  IconChevronLeft,
  IconChevronRight,
  IconRepeat,
  IconExternalLink,
  IconAlertTriangle,
} from './Icons';

export default function SignVideoModal({
  signClass,
  onClose,
  onSelectSign,
  allClasses = SIGN_CLASSES,
}) {
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isLooping, setIsLooping] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorDetails, setErrorDetails] = useState('');
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef(null);

  const currentIndex = signClass
    ? allClasses.findIndex((c) => c.id === signClass.id || c.label === signClass.label)
    : -1;

  const totalClasses = allClasses.length;

  const videoUrl = signClass ? getVideoUrl(signClass) : '';

  // Reset state when active signClass changes
  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
    setErrorDetails('');
    setIsPlaying(true);

    if (videoRef.current) {
      videoRef.current.playbackRate = playbackRate;
      videoRef.current.currentTime = 0;
      videoRef.current.load();
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          // Autoplay policy might pause without mute, handled gracefully
          console.warn('Autoplay prevented:', err.message);
          setIsPlaying(false);
        });
      }
    }
  }, [signClass, videoUrl]);

  // Sync playback rate with video element
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  // Navigate to previous / next sign
  const handlePrev = useCallback(() => {
    if (currentIndex > 0 && onSelectSign) {
      onSelectSign(allClasses[currentIndex - 1]);
    } else if (currentIndex === 0 && onSelectSign) {
      onSelectSign(allClasses[totalClasses - 1]); // Loop back to end
    }
  }, [currentIndex, totalClasses, allClasses, onSelectSign]);

  const handleNext = useCallback(() => {
    if (currentIndex < totalClasses - 1 && onSelectSign) {
      onSelectSign(allClasses[currentIndex + 1]);
    } else if (currentIndex === totalClasses - 1 && onSelectSign) {
      onSelectSign(allClasses[0]); // Loop back to start
    }
  }, [currentIndex, totalClasses, allClasses, onSelectSign]);

  // Keyboard shortcut listener
  useEffect(() => {
    if (!signClass) return;

    const handleKeyDown = (e) => {
      // Don't intercept if user is typing in an input
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        togglePlayPause();
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        handleReplay();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [signClass, handlePrev, handleNext, onClose]);

  const togglePlayPause = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleReplay = () => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = 0;
    videoRef.current.play();
    setIsPlaying(true);
  };

  if (!signClass) return null;

  return (
    <div className="modal-overlay sign-video-overlay" onClick={onClose}>
      <div
        className="modal-dialog sign-video-dialog"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={`Demonstration video for ${signClass.label} (${signClass.bangla})`}
      >
        {/* ── Dialog Header ── */}
        <div className="sign-video-dialog__header">
          <div className="sign-video-dialog__title-area">
            <div className="sign-video-dialog__badge-row">
              <span className="category-pill" style={{ margin: 0 }}>
                {signClass.category || 'General'}
              </span>
              <span className="sign-video-dialog__counter">
                Sign {currentIndex >= 0 ? currentIndex + 1 : signClass.id} of {totalClasses}
              </span>
              <span className="sign-video-dialog__id">Class #{signClass.id}</span>
            </div>

            <div className="sign-video-dialog__names">
              <h2 className="sign-video-dialog__bangla">{signClass.bangla}</h2>
              <span className="sign-video-dialog__roman">{signClass.label}</span>
              <span className="sign-video-dialog__english">"{signClass.english}"</span>
              <button
                type="button"
                onClick={() => speakText(signClass.bangla, 'bn-BD')}
                className="btn btn--sm btn--ghost sign-video-dialog__speech-btn"
                title="Pronounce in Bengali"
                aria-label="Pronounce in Bengali"
              >
                <IconVolume size={18} />
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="btn btn--sm btn--ghost sign-video-dialog__close-btn"
            title="Close video preview (Esc)"
            aria-label="Close"
          >
            <IconX size={20} />
          </button>
        </div>

        {/* ── Video Player Canvas & Stage ── */}
        <div className="sign-video-stage">
          {/* Previous Sign Chevron Button */}
          <button
            type="button"
            className="sign-nav-btn sign-nav-btn--prev"
            onClick={handlePrev}
            title="Previous sign gesture (← Left Arrow)"
            aria-label="Previous sign"
          >
            <IconChevronLeft size={24} />
          </button>

          {/* Video Container */}
          <div className="sign-video-wrapper">
            <video
              ref={videoRef}
              src={videoUrl}
              playsInline
              autoPlay
              muted={isMuted}
              loop={isLooping}
              className="sign-video-element"
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onWaiting={() => setIsLoading(true)}
              onPlaying={() => setIsLoading(false)}
              onLoadedData={() => setIsLoading(false)}
              onError={(e) => {
                setIsLoading(false);
                setHasError(true);
                setErrorDetails(e?.target?.error?.message || 'Video stream could not be loaded');
              }}
            />

            {/* Loading Spinner Indicator */}
            {isLoading && !hasError && (
              <div className="sign-video-loading-overlay">
                <span className="spinner spinner--lg" />
                <span className="sign-video-loading-text">Loading demonstration video...</span>
              </div>
            )}

            {/* Error Message & Direct Link Fallback */}
            {hasError && (
              <div className="sign-video-error-overlay">
                <IconAlertTriangle size={36} className="text-warning" />
                <h4 style={{ margin: '0.5rem 0 0.25rem', color: 'var(--text-primary)' }}>
                  Video Playback Notice
                </h4>
                <p style={{ margin: '0 0 1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Browser could not play this format directly. You can stream or download it directly:
                </p>
                <a
                  href={videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn--sm btn--primary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <IconExternalLink size={16} />
                  <span>Open Video in New Tab</span>
                </a>
              </div>
            )}

            {/* Click-to-Play Overlay Button (visible when paused) */}
            {!isPlaying && !isLoading && !hasError && (
              <button
                type="button"
                className="sign-video-play-overlay"
                onClick={togglePlayPause}
                title="Play video (Space)"
                aria-label="Play"
              >
                <IconPlay size={40} />
              </button>
            )}
          </div>

          {/* Next Sign Chevron Button */}
          <button
            type="button"
            className="sign-nav-btn sign-nav-btn--next"
            onClick={handleNext}
            title="Next sign gesture (→ Right Arrow)"
            aria-label="Next sign"
          >
            <IconChevronRight size={24} />
          </button>
        </div>

        {/* ── Video Control Bar ── */}
        <div className="sign-video-controls">
          {/* Left Controls: Play/Pause, Replay, Loop, Mute */}
          <div className="sign-video-controls__group">
            <button
              type="button"
              className="btn btn--sm btn--secondary sign-video-ctrl-btn"
              onClick={togglePlayPause}
              title={isPlaying ? 'Pause video (Space)' : 'Play video (Space)'}
            >
              {isPlaying ? <IconPause size={16} /> : <IconPlay size={16} />}
              <span>{isPlaying ? 'Pause' : 'Play'}</span>
            </button>

            <button
              type="button"
              className="btn btn--sm btn--ghost sign-video-ctrl-btn"
              onClick={handleReplay}
              title="Replay from start (R)"
            >
              <IconRotateCcw size={15} />
              <span>Replay</span>
            </button>

            <button
              type="button"
              className={`btn btn--sm ${isLooping ? 'btn--secondary' : 'btn--ghost'} sign-video-ctrl-btn`}
              onClick={() => setIsLooping(!isLooping)}
              title={isLooping ? 'Looping enabled (gesture replays continuously)' : 'Loop disabled'}
            >
              <IconRepeat size={15} />
              <span>{isLooping ? 'Loop: ON' : 'Loop: OFF'}</span>
            </button>
          </div>

          {/* Right Controls: Slow Motion / Playback Speed */}
          <div className="sign-video-controls__group">
            <span className="sign-video-speed-label">Speed:</span>
            <div className="speed-pills">
              {[0.5, 0.75, 1.0].map((rate) => (
                <button
                  key={rate}
                  type="button"
                  className={`speed-pill ${playbackRate === rate ? 'speed-pill--active' : ''}`}
                  onClick={() => setPlaybackRate(rate)}
                  title={`Set speed to ${rate}x ${rate < 1 ? '(Slow Motion)' : '(Normal)'}`}
                >
                  {rate === 0.5 ? '0.5x Slow' : rate === 0.75 ? '0.75x' : '1.0x Normal'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Dialog Footer with File Details & Navigation Hints ── */}
        <div className="sign-video-dialog__footer">
          <div className="sign-video-file-info" title={signClass.videoFile}>
            <span className="sign-video-file-icon">🎬</span>
            <span className="sign-video-file-name">{signClass.videoFile}</span>
          </div>

          <div className="sign-video-hotkeys-hint">
            <span>Keys: <kbd>Space</kbd> Play/Pause · <kbd>←</kbd> <kbd>→</kbd> Prev/Next · <kbd>R</kbd> Replay · <kbd>Esc</kbd> Close</span>
          </div>
        </div>
      </div>
    </div>
  );
}
