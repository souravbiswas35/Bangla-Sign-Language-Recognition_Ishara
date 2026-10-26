import React, { useRef, useEffect, useState, useCallback } from 'react';
import { drawLandmarks } from '../utils/drawing';
import { getClassInfo } from '../data/classes';
import { speakText } from '../utils/speech';
import {
  IconCamera,
  IconFlipCamera,
  IconPlay,
  IconSquare,
  IconCircleDot,
  IconZap,
  IconSkeleton,
  IconSilhouette,
  IconActivity,
  IconRefresh,
  IconClock,
  IconCameraFront,
  IconCameraBack,
  IconCameraFlipButton,
  IconCameraSwitch,
  IconVolume,
  IconPlus,
  IconSparkles,
} from './Icons';

// Exponential smoothing helper to eliminate landmark jitter and provide fluid motion
function smoothArray(prev, curr, alpha = 0.70) {
  if (!prev || prev.length === 0) return curr;
  if (!curr || curr.length === 0) return prev;

  const len = Math.min(prev.length, curr.length);
  const smoothed = new Array(len);

  for (let i = 0; i < len; i++) {
    const p = prev[i];
    const c = curr[i];
    if (!p) {
      smoothed[i] = c;
      continue;
    }
    if (!c) {
      smoothed[i] = p;
      continue;
    }

    smoothed[i] = {
      x: p.x * (1 - alpha) + c.x * alpha,
      y: p.y * (1 - alpha) + c.y * alpha,
      z: (p.z ?? 0) * (1 - alpha) + (c.z ?? 0) * alpha,
      visibility: c.visibility ?? p.visibility,
    };
  }
  return smoothed;
}

// ── Dynamic Animated Cyber Constellation Web Background Canvas ──
function CyberWebCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId;
    const parent = canvas.parentElement;
    let width = (canvas.width = parent ? parent.clientWidth || 800 : 800);
    let height = (canvas.height = parent ? parent.clientHeight || 500 : 500);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth || 800;
      height = canvas.height = canvas.parentElement.clientHeight || 500;
    };
    window.addEventListener('resize', handleResize);

    const nodeCount = Math.min(46, Math.max(28, Math.floor((width * height) / 8800)));
    const nodes = [];
    const colors = ['#818cf8', '#60a5fa', '#a855f7', '#38bdf8', '#c084fc'];

    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.95,
        vy: (Math.random() - 0.5) * 0.95,
        r: Math.random() * 2.2 + 1.2,
        color: colors[Math.floor(Math.random() * colors.length)],
        pulse: Math.random() * Math.PI * 2,
      });
    }

    const maxDist = 135;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw connecting glowing cyber web lines
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * 0.45;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(129, 140, 248, ${alpha})`;
            ctx.lineWidth = 1.1;
            ctx.stroke();
          }
        }
      }

      // Draw and update animated particle nodes
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        n.x += n.vx;
        n.y += n.vy;
        n.pulse += 0.04;

        if (n.x < 0 || n.x > width) n.vx *= -1;
        if (n.y < 0 || n.y > height) n.vy *= -1;

        const currentR = n.r + Math.sin(n.pulse) * 0.8;
        ctx.beginPath();
        ctx.arc(n.x, n.y, Math.max(1, currentR), 0, Math.PI * 2);
        ctx.fillStyle = n.color;
        ctx.shadowColor = n.color;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="webcam-animated-web-canvas"
      aria-hidden="true"
    />
  );
}

export default function WebcamView({
  extractKeypoints,
  onGestureComplete,
  onContinuousKeypoint,
  mpReady,
  mpLoading,
  isStreaming,
  setIsStreaming,
  recognitionMode, // 'continuous' (default) | 'gesture'
  setRecognitionMode,
  predictionData,
  confidenceThreshold = 0.50,
  onAddToSentence,
}) {
  const prediction = predictionData?.prediction || null;
  const confidence = predictionData?.confidence ?? 0;
  const isModelMissing = prediction === 'No model loaded' || predictionData?.model_used?.includes('no model');
  const classInfo = prediction && !isModelMissing ? getClassInfo(prediction) : null;
  const isHighConfidence = confidence >= confidenceThreshold;
  const [speakingMobileWord, setSpeakingMobileWord] = useState(false);

  const handleMobilePronounce = () => {
    if (!classInfo) return;
    const text = classInfo.bangla || classInfo.bengali || classInfo.label;
    setSpeakingMobileWord(true);
    speakText(text, 'bn-BD', {
      onEnd: () => setSpeakingMobileWord(false),
    });
    setTimeout(() => setSpeakingMobileWord(false), 3000);
  };
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const animFrameIdRef = useRef(null);

  const [devices, setDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const [showSkeleton, setShowSkeleton] = useState(true);
  const [fps, setFps] = useState(0);
  const [videoAspectRatio, setVideoAspectRatio] = useState('4 / 3');

  const [gestureDuration, setGestureDuration] = useState('3.0'); // String ('2.0', '2.5', '3.0', etc.) ensures exact matching with <option>
  const gestureDurationRef = useRef(3.0);
  gestureDurationRef.current = parseFloat(gestureDuration) || 3.0;

  // Front ('user') vs Back ('environment') Camera selection
  const [facingMode, setFacingMode] = useState('user');
  const facingModeRef = useRef('user');
  facingModeRef.current = facingMode;

  const [isRecording, setIsRecording] = useState(false);
  const [recordProgress, setRecordProgress] = useState(0); // 0 to 100%
  const [showSilhouette, setShowSilhouette] = useState(true);
  const [mirrorKeypoints, setMirrorKeypoints] = useState(false);
  const mirrorKeypointsRef = useRef(false);
  mirrorKeypointsRef.current = mirrorKeypoints;

  const isRecordingRef = useRef(false);
  const gestureBufferRef = useRef([]);
  const recordStartTimeRef = useRef(0);
  const modeRef = useRef(recognitionMode);
  modeRef.current = recognitionMode;

  // Smoothing state refs
  const smoothedLandmarksRef = useRef({
    pose: null,
    hands: [],
  });

  const isDetectingRef = useRef(false);

  const [landmarksStats, setLandmarksStats] = useState({
    pose: false,
    handsCount: 0,
    face: false,
  });

  const fpsCountRef = useRef(0);
  const fpsTimeRef = useRef(performance.now());
  const lastTelemetryTimeRef = useRef(0);
  const lastDetectionTimeRef = useRef(0);

  // Enumerate camera devices
  useEffect(() => {
    async function getDevices() {
      try {
        if (!navigator.mediaDevices?.enumerateDevices) return;
        const allDevices = await navigator.mediaDevices.enumerateDevices();
        const videoInputs = allDevices.filter((d) => d.kind === 'videoinput');
        setDevices(videoInputs);
        if (videoInputs.length > 0 && !selectedDeviceId) {
          setSelectedDeviceId(videoInputs[0].deviceId);
        }
      } catch (err) {
        console.warn('Could not enumerate video devices:', err);
      }
    }
    getDevices();
  }, [selectedDeviceId]);

  // Start webcam with performance-optimized resolution and explicit facingMode
  const startCamera = useCallback(async (overrideFacingMode = null, overrideDeviceId = null) => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        const secureUrl = 'https://' + (window.location.host || 'localhost:5174');
        alert(
          'Camera access requires a Secure Context (HTTPS).\n\n' +
          '• To test on your mobile phone, open:\n' + secureUrl + '\n\n' +
          '• When warned "Your connection is not private", tap "Advanced" → "Proceed to ' + window.location.hostname + ' (unsafe)".'
        );
        return;
      }

      const targetFacing = overrideFacingMode || facingModeRef.current || 'user';
      const targetDevice = overrideDeviceId !== null ? overrideDeviceId : selectedDeviceId;

      const videoConstraints = {
        width: { ideal: 640, min: 480 },
        height: { ideal: 480, min: 360 },
        frameRate: { ideal: 30, max: 60 },
      };

      if (targetDevice && !overrideFacingMode) {
        videoConstraints.deviceId = { exact: targetDevice };
      } else {
        videoConstraints.facingMode = { ideal: targetFacing };
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: videoConstraints,
        audio: false,
      });

      streamRef.current = stream;

      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        const settings = videoTrack.getSettings ? videoTrack.getSettings() : {};
        if (settings.facingMode) {
          setFacingMode(settings.facingMode);
          facingModeRef.current = settings.facingMode;
        } else if (overrideFacingMode) {
          setFacingMode(overrideFacingMode);
          facingModeRef.current = overrideFacingMode;
        }
        if (settings.deviceId) {
          setSelectedDeviceId(settings.deviceId);
        }
      }

      // Re-enumerate devices after camera permission is granted
      if (navigator.mediaDevices.enumerateDevices) {
        try {
          const allDevices = await navigator.mediaDevices.enumerateDevices();
          const videoInputs = allDevices.filter((d) => d.kind === 'videoinput');
          setDevices(videoInputs);
        } catch (e) {
          // ignore enumeration error
        }
      }

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setIsStreaming(true);
    } catch (err) {
      console.error('Camera access failed:', err);
      try {
        const fallbackStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: overrideFacingMode || facingModeRef.current || 'user' } },
          audio: false,
        });
        streamRef.current = fallbackStream;
        if (videoRef.current) {
          videoRef.current.srcObject = fallbackStream;
          await videoRef.current.play();
        }
        setIsStreaming(true);
      } catch (fbErr) {
        let msg = 'Unable to access camera.\n\n';
        if (err.name === 'NotAllowedError' || fbErr.name === 'NotAllowedError') {
          msg += '• Permission Denied: Please tap the lock/tune icon in your browser address bar and set Camera to "Allow".';
        } else if (err.name === 'NotReadableError' || fbErr.name === 'NotReadableError') {
          msg += '• Camera in Use: The camera is currently being used by another app or browser tab. Please close other camera apps and retry.';
        } else {
          msg += '• Error details: ' + (err.message || fbErr.message);
        }
        alert(msg);
        setIsStreaming(false);
      }
    }
  }, [selectedDeviceId, setIsStreaming]);

  // Switch between front and back camera (100% reliable on phones and tablets)
  const handleToggleFacingMode = useCallback(async (targetMode) => {
    const nextMode = targetMode || (facingModeRef.current === 'user' ? 'environment' : 'user');
    setFacingMode(nextMode);
    facingModeRef.current = nextMode;
    setSelectedDeviceId(''); // Clear deviceId so facingMode takes precedence
    if (isStreaming) {
      await startCamera(nextMode, '');
    }
  }, [isStreaming, startCamera]);

  // Stop webcam stream
  const stopCamera = useCallback(() => {
    if (animFrameIdRef.current) {
      cancelAnimationFrame(animFrameIdRef.current);
      animFrameIdRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
    setIsStreaming(false);
    setIsRecording(false);
    isRecordingRef.current = false;
    setFps(0);
    setLandmarksStats({ pose: false, handsCount: 0, face: false });
  }, [setIsStreaming]);

  // Update canvas & stage aspect ratio when video metadata loads
  const handleLoadedMetadata = () => {
    const video = videoRef.current;
    if (!video) return;
    const w = video.videoWidth || 640;
    const h = video.videoHeight || 480;
    setVideoAspectRatio(`${w} / ${h}`);
    if (canvasRef.current) {
      canvasRef.current.width = w;
      canvasRef.current.height = h;
    }
  };

  // Uniformly resample any number of recorded frames to exactly 30 frames
  // (Verbatim replica of `np.linspace(0, total-1, 30)` from notebook Cell 18)
  const resampleTo30Frames = (buffer) => {
    if (!buffer || buffer.length === 0) return null;
    const total = buffer.length;
    if (total === 30) return buffer;

    const resampled = [];
    for (let i = 0; i < 30; i++) {
      const idx = Math.min(total - 1, Math.round((i * (total - 1)) / 29));
      resampled.push(buffer[idx]);
    }
    return resampled;
  };

  // Helper to mirror X coordinates and swap hands for model alignment testing (225-D)
  const applyMirrorTransform = useCallback((kp) => {
    const mirrored = new Float32Array(kp);
    // Pose (0..98): 33 x 3 (x, y, z) - Invert X since it is shoulder-centered
    for (let i = 0; i < 33 * 3; i += 3) {
      if (mirrored[i] !== 0 || mirrored[i + 1] !== 0) {
        mirrored[i] = -mirrored[i];
      }
    }
    // Hands: Left (99..161), Right (162..224)
    const leftSlice = new Float32Array(63);
    const rightSlice = new Float32Array(63);
    for (let i = 0; i < 63; i += 3) {
      const lx = mirrored[99 + i];
      const ly = mirrored[99 + i + 1];
      const lz = mirrored[99 + i + 2];
      leftSlice[i] = (lx !== 0 || ly !== 0) ? -lx : 0;
      leftSlice[i + 1] = ly;
      leftSlice[i + 2] = lz;

      const rx = mirrored[162 + i];
      const ry = mirrored[162 + i + 1];
      const rz = mirrored[162 + i + 2];
      rightSlice[i] = (rx !== 0 || ry !== 0) ? -rx : 0;
      rightSlice[i + 1] = ry;
      rightSlice[i + 2] = rz;
    }
    // Swap left and right hand slices
    mirrored.set(rightSlice, 99);
    mirrored.set(leftSlice, 162);
    return mirrored;
  }, []);

  // Finish gesture recording and send the 30-frame sequence for recognition
  const finishRecording = useCallback(() => {
    setIsRecording(false);
    isRecordingRef.current = false;
    setRecordProgress(100);

    const recorded = gestureBufferRef.current;
    if (recorded && recorded.length >= 8) {
      let frames30 = resampleTo30Frames(recorded);
      if (frames30 && onGestureComplete) {
        if (mirrorKeypointsRef.current) {
          frames30 = frames30.map((f) => applyMirrorTransform(f));
        }
        onGestureComplete(frames30);
      }
    } else {
      console.warn('Gesture recording too short (<8 frames)');
    }

    setTimeout(() => {
      setRecordProgress(0);
    }, 400);
  }, [onGestureComplete, applyMirrorTransform]);

  // Start the sign gesture recording process
  const startGestureRecording = useCallback(() => {
    if (!isStreaming || isRecordingRef.current) return;

    gestureBufferRef.current = [];
    setIsRecording(true);
    isRecordingRef.current = true;
    recordStartTimeRef.current = performance.now();
    setRecordProgress(0);
  }, [isStreaming]);

  // Keyboard shortcut: Spacebar triggers sign recording
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space' && e.target.tagName !== 'INPUT' && isStreaming) {
        e.preventDefault();
        if (isRecordingRef.current) {
          finishRecording();
        } else {
          startGestureRecording();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isStreaming, startGestureRecording, finishRecording]);

  // High-frequency render loop (60 FPS with async detection & landmark smoothing)
  useEffect(() => {
    if (!isStreaming || !mpReady) return;

    let isRunning = true;

    const renderLoop = () => {
      if (!isRunning) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (video && video.readyState >= 2 && canvas) {
        const width = video.videoWidth;
        const height = video.videoHeight;

        if (canvas.width !== width || canvas.height !== height) {
          canvas.width = width;
          canvas.height = height;
        }

        const ctx = canvas.getContext('2d');
        const now = performance.now();

        // FPS calculation
        fpsCountRef.current++;
        if (now - fpsTimeRef.current >= 1000) {
          setFps(fpsCountRef.current);
          fpsCountRef.current = 0;
          fpsTimeRef.current = now;
        }

        // Throttle landmark detection to ~30 FPS (every 32ms) to eliminate camera lag and smooth out capture
        const canDetect = extractKeypoints && !isDetectingRef.current && (now - lastDetectionTimeRef.current >= 32);

        if (canDetect) {
          isDetectingRef.current = true;
          lastDetectionTimeRef.current = now;

          const result = extractKeypoints(video, now);
          isDetectingRef.current = false;

          if (result && result.landmarks) {
            // Apply smoothing for natural motion flow
            const smoothPose = smoothArray(
              smoothedLandmarksRef.current.pose,
              result.landmarks.pose,
              0.75
            );
            smoothedLandmarksRef.current.pose = smoothPose;

            const smoothHands = (result.landmarks.hands || []).map((h, i) =>
              smoothArray(smoothedLandmarksRef.current.hands[i], h, 0.80)
            );
            smoothedLandmarksRef.current.hands = smoothHands;

            // Draw smoothed landmarks immediately
            if (showSkeleton && ctx) {
              drawLandmarks(
                ctx,
                {
                  pose: smoothPose,
                  face: result.landmarks.face,
                  hands: smoothHands,
                  handedness: result.landmarks.handedness,
                },
                width,
                height,
                {
                  showPose: true,
                  showHands: true,
                  showFace: true,
                }
              );
            } else if (ctx) {
              ctx.clearRect(0, 0, width, height);
            }

            // Gesture recording buffer accumulation
            if (isRecordingRef.current && result.keypoints) {
              gestureBufferRef.current.push(result.keypoints);

              const currentDur = gestureDurationRef.current || 3.0;
              const elapsed = (now - recordStartTimeRef.current) / 1000;
              const pct = Math.min(100, Math.round((elapsed / currentDur) * 100));
              setRecordProgress(pct);

              if (elapsed >= currentDur) {
                finishRecording();
              }
            } else if (modeRef.current === 'continuous' && result.keypoints && onContinuousKeypoint) {
              const kp = mirrorKeypointsRef.current
                ? applyMirrorTransform(result.keypoints)
                : result.keypoints;
              onContinuousKeypoint(kp);
            }

            // Throttle telemetry state updates to 300ms intervals
            if (now - lastTelemetryTimeRef.current > 300) {
              setLandmarksStats({
                pose: !!result.landmarks.pose,
                handsCount: result.landmarks.hands ? result.landmarks.hands.length : 0,
                face: !!result.landmarks.face,
              });
              lastTelemetryTimeRef.current = now;
            }
          }
        }
      }

      animFrameIdRef.current = requestAnimationFrame(renderLoop);
    };

    animFrameIdRef.current = requestAnimationFrame(renderLoop);

    return () => {
      isRunning = false;
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [
    isStreaming,
    mpReady,
    extractKeypoints,
    showSkeleton,
    gestureDuration,
    finishRecording,
    onContinuousKeypoint,
  ]);

  // Clean up stream on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  return (
    <div className="webcam-section">
      {/* ── Gesture Recognition Mode Switcher Bar: Continuous on Left (Default) ── */}
      <div className="gesture-mode-bar">
        <button
          type="button"
          className={`gesture-mode-btn ${recognitionMode === 'continuous' ? 'gesture-mode-btn--active' : ''}`}
          onClick={() => setRecognitionMode('continuous')}
          title="Live Streaming: Rolling 30-frame continuous translation window"
        >
          <IconZap size={15} />
          <span className="gesture-mode-btn__title">Live Streaming Mode</span>
          <span className="gesture-mode-btn__badge gesture-mode-btn__badge--realtime">Continuous</span>
        </button>
        <button
          type="button"
          className={`gesture-mode-btn ${recognitionMode === 'gesture' ? 'gesture-mode-btn--active' : ''}`}
          onClick={() => setRecognitionMode('gesture')}
          title="Sign Gesture Mode: Complete 2.5-3.0s sign gesture capture before inference"
        >
          <IconCircleDot size={15} />
          <span className="gesture-mode-btn__title">Sign Gesture Mode</span>
          <span className="gesture-mode-btn__badge">High Accuracy</span>
        </button>
      </div>

      {/* ── Video & Canvas Stage with Exact Aspect Ratio Matching ── */}
      <div className={`webcam-container ${isStreaming ? 'webcam-container--active' : ''}`}>
        <div
          className="webcam-stage"
          style={{
            aspectRatio: videoAspectRatio,
            position: 'relative',
            width: '100%',
            overflow: 'hidden',
          }}
        >
          <video
            ref={videoRef}
            playsInline
            muted
            autoPlay
            onLoadedMetadata={handleLoadedMetadata}
            style={{
              width: '100%',
              height: '100%',
              display: 'block',
              objectFit: 'fill',
              transform: facingMode === 'user' ? 'scaleX(-1)' : 'scaleX(1)',
            }}
          />
          <canvas
            ref={canvasRef}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'fill',
              transform: facingMode === 'user' ? 'scaleX(-1)' : 'scaleX(1)',
              pointerEvents: 'none',
            }}
          />

          {/* ── Smartphone Floating Quick-Flip Glass Button (Exact Reference Design) ── */}
          <button
            type="button"
            className="floating-camera-flip-btn"
            onClick={() => handleToggleFacingMode()}
            title={`Switch Camera (Currently on ${facingMode === 'user' ? 'Front' : 'Back'})`}
            aria-label="Flip Camera"
          >
            <div className="floating-camera-flip-btn__circle">
              <IconCamera size={14} />
            </div>
            <span className="floating-camera-flip-btn__label">
              {facingMode === 'user' ? 'FRONT' : 'BACK'}
            </span>
            <svg
              className="floating-camera-flip-btn__chevron"
              viewBox="0 0 20 20"
              fill="currentColor"
              width="14"
              height="14"
            >
              <path
                fillRule="evenodd"
                d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                clipRule="evenodd"
              />
            </svg>
          </button>

          {/* Framing Silhouette Guide Overlay (Aligns user with training dataset distance) */}
          {showSilhouette && isStreaming && (
            <svg
              viewBox="0 0 640 480"
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: 4,
                opacity: 0.45,
              }}
            >
              {/* Head Silhouette */}
              <ellipse
                cx="320"
                cy="130"
                rx="60"
                ry="75"
                fill="none"
                stroke="#6366f1"
                strokeWidth="2.5"
                strokeDasharray="6 4"
              />
              {/* Shoulders & Torso */}
              <path
                d="M 180 320 C 180 250, 260 230, 320 230 C 380 230, 460 250, 460 320 L 460 480 L 180 480 Z"
                fill="rgba(99, 102, 241, 0.04)"
                stroke="#6366f1"
                strokeWidth="2.5"
                strokeDasharray="6 4"
              />
              {/* Gesture Zone Box */}
              <rect
                x="150"
                y="220"
                width="340"
                height="220"
                rx="14"
                fill="none"
                stroke="#22c55e"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
              <text
                x="320"
                y="240"
                fill="#4ade80"
                fontSize="12"
                textAnchor="middle"
                fontWeight="700"
                letterSpacing="1px"
              >
                SIGN GESTURE ZONE
              </text>
              <text
                x="320"
                y="38"
                fill="#c7d2fe"
                fontSize="12"
                textAnchor="middle"
                fontWeight="600"
              >
                Align Head & Shoulders with Silhouette for 94% Model Distribution
              </text>
            </svg>
          )}

          {/* Recording Border Effect */}
          {isRecording && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                border: '4px solid #ef4444',
                boxShadow: 'inset 0 0 30px rgba(239, 68, 68, 0.4)',
                pointerEvents: 'none',
                animation: 'pulse-dot 1.5s infinite',
              }}
            />
          )}

          {/* Overlay when Camera is Off (Animated Cyber Web Backdrop & Concentric Ring) */}
          {!isStreaming && (
            <div className="webcam-overlay">
              {/* Dynamic Living Cyber Constellation Web (60 FPS Animated Canvas) */}
              <CyberWebCanvas />

              {/* Ambient Center Aura Glow */}
              <div className="webcam-overlay__aura" />

              {/* Organic Flowing Silk Aurora Waves at the bottom */}
              <div className="webcam-silk-waves" aria-hidden="true">
                <svg viewBox="0 0 800 240" preserveAspectRatio="none" className="webcam-waves-svg">
                  <defs>
                    <linearGradient id="waveSilkGrad1" x1="0%" y1="100%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#1e1b4b" stopOpacity="0.85" />
                      <stop offset="50%" stopColor="#2e1065" stopOpacity="0.5" />
                      <stop offset="100%" stopColor="transparent" stopOpacity="0" />
                    </linearGradient>
                    <linearGradient id="waveSilkGrad2" x1="100%" y1="100%" x2="0%" y2="0%">
                      <stop offset="0%" stopColor="#172554" stopOpacity="0.75" />
                      <stop offset="60%" stopColor="#312e81" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="transparent" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path
                    className="web-silk-wave-1"
                    d="M 0 120 Q 220 50, 440 160 T 800 130 L 800 240 L 0 240 Z"
                    fill="url(#waveSilkGrad1)"
                  />
                  <path
                    className="web-silk-wave-2"
                    d="M 0 170 Q 260 100, 520 190 T 800 180 L 800 240 L 0 240 Z"
                    fill="url(#waveSilkGrad2)"
                  />
                </svg>
              </div>

              {/* Concentric Glowing Camera Center Ring */}
              <div className="webcam-cyber-ring">
                <div className="webcam-cyber-ring__ripple" />
                <div className="webcam-cyber-ring__outer" />
                <div className="webcam-cyber-ring__ticks" />
                <div className="webcam-cyber-ring__inner">
                  <IconCamera size={38} className="webcam-cyber-camera-icon" />
                </div>
              </div>

              <p className="webcam-overlay__text">
                {mpLoading
                  ? 'Initializing MediaPipe AI models in browser...'
                  : 'Webcam is off. Click below to start live sign recognition.'}
              </p>

              <button
                type="button"
                className="webcam-start-btn"
                onClick={() => startCamera()}
                disabled={mpLoading}
              >
                {mpLoading ? (
                  <>
                    <IconRefresh size={18} className="spinner" />
                    <span>Loading AI Engine...</span>
                  </>
                ) : (
                  <>
                    <IconPlay size={16} />
                    <span>Start Webcam</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Active Recording Banner */}
          {isRecording && (
            <div
              style={{
                position: 'absolute',
                top: '16px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'rgba(239, 68, 68, 0.95)',
                color: '#fff',
                padding: '0.45rem 1.4rem',
                borderRadius: '9999px',
                fontSize: '0.88rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 20px rgba(239, 68, 68, 0.6)',
                zIndex: 10,
              }}
            >
              <span
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  background: '#fff',
                  animation: 'pulse-dot 0.8s infinite',
                }}
              />
              PERFORMING SIGN ({recordProgress}%)
            </div>
          )}
        </div>
      </div>

      {/* ── Mobile Real-Time Prediction HUD (Visible only on Mobile, perfectly in front with NO scrolling) ── */}
      <div className="mobile-prediction-hud">
        {classInfo ? (
          <div className="mobile-prediction-hud__content">
            <div className="mobile-prediction-hud__text-group">
              <div className="mobile-prediction-hud__header-row">
                <span className="mobile-prediction-hud__badge">
                  <span className="live-pulse-dot" />
                  {isHighConfidence ? 'Confident Match' : 'Evaluating…'}
                </span>
                <span className="mobile-prediction-hud__conf">
                  {Math.round(confidence * 100)}% Match
                </span>
                <span className="mobile-prediction-hud__tag">
                  {classInfo.category}
                </span>
              </div>
              <div className="mobile-prediction-hud__bangla">
                {classInfo.bangla || classInfo.bengali}
              </div>
              <div className="mobile-prediction-hud__english">
                {classInfo.label} • "{classInfo.english}"
              </div>
            </div>

            <div className="mobile-prediction-hud__actions">
              <button
                type="button"
                className={`mobile-hud-btn ${speakingMobileWord ? 'mobile-hud-btn--active' : ''}`}
                onClick={handleMobilePronounce}
                title="Pronounce in accurate Bangla"
              >
                <IconVolume size={18} />
                <span>{speakingMobileWord ? 'Speaking…' : 'Pronounce'}</span>
              </button>

              {onAddToSentence && (
                <button
                  type="button"
                  className="mobile-hud-btn mobile-hud-btn--add"
                  onClick={() => onAddToSentence(classInfo)}
                  title="Add word to continuous sentence"
                >
                  <IconPlus size={18} />
                  <span>Add Word</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="mobile-prediction-hud__placeholder">
            <div className="mobile-prediction-hud__placeholder-icon">
              <IconSparkles size={18} />
            </div>
            <div className="mobile-prediction-hud__placeholder-text">
              <span className="mobile-prediction-hud__placeholder-main">
                {recognitionMode === 'continuous'
                  ? 'Live Streaming Active: Perform a sign to see real-time translation'
                  : 'Sign Gesture Mode: Perform complete gesture for recognition'}
              </span>
              <span className="mobile-prediction-hud__placeholder-sub">
                Real-time Bangla translation appears here directly in front without scrolling
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ── Gesture Recording Progress Bar ── */}
      {recognitionMode === 'gesture' ? (
        <div className="buffer-bar" style={{ background: isRecording ? 'rgba(239, 68, 68, 0.1)' : undefined }}>
          <span className="buffer-bar__label" style={{ fontWeight: 600 }}>
            {isRecording ? 'Capturing Gesture:' : 'Gesture Duration:'}
          </span>
          <div className="buffer-bar__track">
            <div
              className="buffer-bar__fill"
              style={{
                width: `${recordProgress}%`,
                background: isRecording
                  ? 'linear-gradient(90deg, #ef4444, #f59e0b)'
                  : 'linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))',
              }}
            />
          </div>
          <span className="buffer-bar__count">
            {isRecording
              ? `${Math.round((recordProgress / 100) * (parseFloat(gestureDuration) || 3) * 10) / 10}s`
              : `${gestureDuration}s`}
          </span>
        </div>
      ) : null}

      {/* ── Structured Control Boxes (Safe for Desktop & Mobile) ── */}
      <div className="webcam-controls-panel">
        {/* Box 1: Primary Action & Sign Capture Duration */}
        <div className="webcam-controls-box webcam-controls-box--primary">
          {recognitionMode === 'gesture' ? (
            <button
              className={`btn ${isRecording ? 'btn--danger' : 'btn--primary'} btn--perform-sign`}
              onClick={isRecording ? finishRecording : startGestureRecording}
              disabled={!isStreaming}
              title="Tip: Press Spacebar anytime to trigger sign recording"
            >
              {isRecording ? (
                <>
                  <IconSquare size={17} />
                  <span>Stop & Predict</span>
                  <span className="spacebar-hint">(Spacebar)</span>
                </>
              ) : (
                <>
                  <IconCircleDot size={17} />
                  <span>Perform Sign</span>
                  <span className="spacebar-hint">(Spacebar)</span>
                </>
              )}
            </button>
          ) : null}

          {/* Gesture Duration Selector Box with Instant Color Matching & Visual Feedback */}
          {recognitionMode === 'gesture' && (
            <div className="duration-picker-box">
              <div className="duration-picker-label">
                <IconClock size={14} />
                <span>Duration:</span>
              </div>
              <div className="select-wrapper duration-select-wrapper">
                <select
                  value={gestureDuration}
                  onChange={(e) => setGestureDuration(e.target.value)}
                  disabled={isRecording}
                  aria-label="Select gesture duration"
                  className="duration-select"
                >
                  <option value="2.0">2.0 seconds</option>
                  <option value="2.5">2.5 seconds</option>
                  <option value="3.0">3.0s (Recommended)</option>
                  <option value="3.5">3.5 seconds</option>
                  <option value="4.0">4.0 seconds</option>
                </select>
              </div>
              <span className="duration-feedback-pill" title="Currently selected gesture duration">
                {gestureDuration}s
              </span>
            </div>
          )}
        </div>

        {/* Box 2: Camera Controls (Power, Minimized 1-Button Camera Switcher, FPS) */}
        <div className="webcam-controls-box webcam-controls-box--secondary">
          <div className="camera-power-group">
            {isStreaming ? (
              <button className="btn btn--sm btn--danger btn--camera-power" onClick={stopCamera}>
                <IconSquare size={14} />
                <span>Turn Off Camera</span>
              </button>
            ) : (
              <button className="btn btn--sm btn--primary btn--camera-power" onClick={() => startCamera()} disabled={mpLoading}>
                <IconPlay size={14} />
                <span>Start Camera</span>
              </button>
            )}

            {/* Minimized 1-Button Front/Back Camera Switcher */}
            <button
              type="button"
              className="btn btn--sm btn--secondary btn--camera-flip"
              onClick={() => handleToggleFacingMode()}
              title={`Flip between Front and Back camera (Currently on ${facingMode === 'user' ? 'Front' : 'Back'})`}
            >
              <IconCameraSwitch size={15} />
              <span>Flip Camera</span>
              <span className="camera-flip-badge">
                {facingMode === 'user' ? 'Front' : 'Back'}
              </span>
            </button>
          </div>

          <div className="camera-meta-group">
            {devices.length > 2 && (
              <div className="select-wrapper camera-device-select-wrapper">
                <select
                  value={selectedDeviceId}
                  onChange={(e) => {
                    setSelectedDeviceId(e.target.value);
                    if (isStreaming) startCamera(null, e.target.value);
                  }}
                  aria-label="Select Camera Device"
                >
                  {devices.map((device, idx) => (
                    <option key={device.deviceId || idx} value={device.deviceId}>
                      {device.label || `Camera ${idx + 1}`}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="fps-badge">
              <IconActivity size={13} />
              <span>{fps} FPS</span>
            </div>
          </div>
        </div>

        {/* Box 3: Landmark Skeleton, Silhouette Guide & Coordinate Inversion Toggles */}
        <div className="webcam-controls-box webcam-controls-box--toggles">
          <button
            className={`btn btn--sm ${showSkeleton ? 'btn--primary' : 'btn--ghost'}`}
            onClick={() => setShowSkeleton(!showSkeleton)}
            title="Toggle landmark skeleton overlay"
          >
            <IconSkeleton size={14} />
            <span>Skeleton: {showSkeleton ? 'ON' : 'OFF'}</span>
          </button>

          <button
            className={`btn btn--sm ${showSilhouette ? 'btn--primary' : 'btn--ghost'}`}
            onClick={() => setShowSilhouette(!showSilhouette)}
            title="Toggle dataset distance & silhouette alignment guide"
          >
            <IconSilhouette size={14} />
            <span>Guide: {showSilhouette ? 'ON' : 'OFF'}</span>
          </button>

          <button
            className={`btn btn--sm ${mirrorKeypoints ? 'btn--primary' : 'btn--ghost'}`}
            onClick={() => setMirrorKeypoints(!mirrorKeypoints)}
            title="Toggle X-axis coordinate inversion and hand slot swap to test model camera perspective"
          >
            <IconFlipCamera size={14} />
            <span>Mirror X: {mirrorKeypoints ? 'ON' : 'OFF'}</span>
          </button>
        </div>
      </div>

      {/* ── Real-time Landmark Telemetry ── */}
      <div className="landmark-stats">
        <div className="landmark-stat">
          <span className="landmark-stat__label">Pose Skeleton</span>
          <span
            className={`landmark-stat__value ${
              landmarksStats.pose ? 'landmark-stat__value--green' : 'landmark-stat__value--red'
            }`}
          >
            {landmarksStats.pose ? 'Tracking (33 pts)' : 'Searching...'}
          </span>
        </div>

        <div className="landmark-stat">
          <span className="landmark-stat__label">Hands Detected</span>
          <span
            className={`landmark-stat__value ${
              landmarksStats.handsCount > 0 ? 'landmark-stat__value--blue' : 'landmark-stat__value--yellow'
            }`}
          >
            {landmarksStats.handsCount === 2
              ? 'Both Hands (42 pts)'
              : landmarksStats.handsCount === 1
              ? 'One Hand (21 pts)'
              : 'No Hands Detected'}
          </span>
        </div>

        <div className="landmark-stat">
          <span className="landmark-stat__label">Face Contour</span>
          <span
            className={`landmark-stat__value ${
              landmarksStats.face ? 'landmark-stat__value--green' : 'landmark-stat__value--yellow'
            }`}
          >
            {landmarksStats.face ? 'Tracking (468 pts)' : 'Searching...'}
          </span>
        </div>

        <div className="landmark-stat">
          <span className="landmark-stat__label">Gesture Frame Buffer</span>
          <span className="landmark-stat__value landmark-stat__value--blue">
            {isRecording ? `${gestureBufferRef.current.length} frames (downsamples to 30)` : '30-Frame Tensor'}
          </span>
        </div>
      </div>
    </div>
  );
}
