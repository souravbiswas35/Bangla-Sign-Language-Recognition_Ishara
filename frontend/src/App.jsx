import React, { useState, useCallback, useRef, useEffect } from 'react';
import Header from './components/Header';
import WebcamView from './components/WebcamView';
import VideoUploadView from './components/VideoUploadView';
import PredictionPanel from './components/PredictionPanel';
import GlossaryModal from './components/GlossaryModal';
import { IconCamera, IconVideo } from './components/Icons';
import useMediaPipe from './hooks/useMediaPipe';
import useSignWebSocket from './hooks/useSignWebSocket';
import { getClassInfo } from './data/classes';
import { apiUrl, getWsUrl } from './config';

export default function App() {
  const [activeTab, setActiveTab] = useState('webcam'); // 'webcam' | 'video_upload'
  const [selectedModel, setSelectedModel] = useState('Transformer');
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.50);
  const [sentence, setSentence] = useState([]);
  const [isGlossaryOpen, setIsGlossaryOpen] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [recognitionMode, setRecognitionMode] = useState('continuous'); // 'continuous' (default) | 'gesture'
  const [serverInfo, setServerInfo] = useState({ models: [], scaler_loaded: false });

  // Light / Dark Theme State
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('ishara-theme');
      if (stored) return stored;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'dark';
  });

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      if (typeof window !== 'undefined') {
        localStorage.setItem('ishara-theme', next);
        document.documentElement.setAttribute('data-theme', next);
      }
      return next;
    });
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Auto-accumulate sentence state
  const lastAddedWordRef = useRef(null);
  const lastAddedTimeRef = useRef(0);

  // Initialize MediaPipe Tasks Vision client-side
  const {
    ready: mpReady,
    loading: mpLoading,
    error: mpError,
    extractKeypoints,
  } = useMediaPipe();

  // Initialize WebSocket connection (proxies via wss if HTTPS, or direct ws on port 8000 / remote backend)
  const wsUrl = getWsUrl('/ws/predict');

  const {
    status: wsStatus,
    bufferedFrames,
    prediction,
    latency,
    sendKeypoints,
    sendSequence,
    setPrediction,
  } = useSignWebSocket(wsUrl);

  // Fetch backend models status
  const fetchServerModels = useCallback(async () => {
    try {
      const res = await fetch(apiUrl('/api/models'));
      if (res.ok) {
        const data = await res.json();
        setServerInfo({
          models: data.models || [],
          scaler_loaded: !!data.scaler_loaded,
        });
        if (data.default && !data.models.includes(selectedModel)) {
          setSelectedModel(data.default);
        }
      }
    } catch (err) {
      console.warn('Could not query /api/models:', err);
    }
  }, [selectedModel]);

  useEffect(() => {
    fetchServerModels();
  }, [fetchServerModels, wsStatus]);

  const handleReloadModels = async () => {
    try {
      const res = await fetch(apiUrl('/api/models/reload'), { method: 'POST' });
      if (res.ok) {
        await fetchServerModels();
        alert('Model weights successfully reloaded from backend/models/!');
      }
    } catch (err) {
      alert('Failed to reload models: ' + err.message);
    }
  };

  // Called when user finishes performing a 2-3s sign gesture
  const handleGestureComplete = useCallback(
    async (frames30) => {
      if (!frames30 || frames30.length !== 30) return;

      // 1. Try sending over WebSocket
      const sentViaWs = sendSequence(frames30, selectedModel);

      // 2. Also send over REST API as fallback/instant prediction
      try {
        const rawSeq = frames30.map((f) => Array.from(f));
        const res = await fetch(apiUrl('/api/predict'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sequence: rawSeq, model: selectedModel }),
        });

        if (res.ok) {
          const result = await res.json();
          if (result && result.prediction && result.prediction !== 'No model loaded') {
            setPrediction({
              prediction: result.prediction,
              confidence: result.confidence,
              top5: result.top5 || [],
              model_used: result.model_used,
              timestamp: Date.now(),
            });

            // Automatically append confident signs to sentence
            if (result.confidence >= confidenceThreshold) {
              const info = getClassInfo(result.prediction);
              setSentence((prev) => [...prev, info]);
            }
          }
        }
      } catch (err) {
        console.warn('REST predict fallback error:', err);
      }
    },
    [sendSequence, selectedModel, setPrediction, confidenceThreshold]
  );

  // Called continuously in live streaming mode
  const handleContinuousKeypoint = useCallback(
    (keypoint) => {
      sendKeypoints(keypoint, selectedModel);
    },
    [sendKeypoints, selectedModel]
  );

  // Auto-append high-confidence predictions to the sentence builder in continuous mode
  useEffect(() => {
    if (!prediction || !prediction.prediction || prediction.prediction === 'No model loaded') {
      return;
    }
    if (recognitionMode !== 'continuous') return;

    const label = prediction.prediction;
    const confidence = prediction.confidence ?? 0;
    const now = Date.now();

    if (confidence >= confidenceThreshold && now - lastAddedTimeRef.current > 2000) {
      if (lastAddedWordRef.current !== label) {
        const info = getClassInfo(label);
        setSentence((prev) => [...prev, info]);
        lastAddedWordRef.current = label;
        lastAddedTimeRef.current = now;
      }
    }
  }, [prediction, confidenceThreshold, recognitionMode]);

  return (
    <div className="app">
      <Header
        wsStatus={wsStatus}
        mpReady={mpReady}
        mpLoading={mpLoading}
        latency={latency}
        serverInfo={serverInfo}
        onOpenGlossary={() => setIsGlossaryOpen(true)}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Primary Mode Switcher (Desktop Tabs + Mobile Dropdown Box) */}
      <div className="tab-navigation-container">
        {/* Desktop Tabs View */}
        <div className="tab-navigation tab-navigation--desktop">
          <button
            type="button"
            className={`tab-btn ${activeTab === 'webcam' ? 'tab-btn--active' : ''}`}
            onClick={() => setActiveTab('webcam')}
          >
            <IconCamera size={18} />
            <span>Live Webcam Recognition</span>
            <span className="tab-btn__tag">Interactive</span>
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'video_upload' ? 'tab-btn--active' : ''}`}
            onClick={() => setActiveTab('video_upload')}
          >
            <IconVideo size={18} />
            <span>Benchmark Dataset Video Test</span>
            <span className="tab-btn__badge">94.3% Model Accuracy</span>
          </button>
        </div>

        {/* Mobile Dropdown View (Clean card layout safe for mobile) */}
        <div className="tab-navigation--mobile">
          <div className="mobile-mode-box">
            <div className="mobile-mode-box__header">
              <div className="mobile-mode-box__title">
                {activeTab === 'webcam' ? <IconCamera size={16} /> : <IconVideo size={16} />}
                <span>Active Recognition Mode</span>
              </div>
              <span className="mobile-mode-box__tag">
                {activeTab === 'webcam' ? 'Interactive' : '94.3% Benchmark'}
              </span>
            </div>
            <div className="select-wrapper mobile-mode-select-wrapper">
              <select
                value={activeTab}
                onChange={(e) => setActiveTab(e.target.value)}
                className="mobile-mode-select"
                aria-label="Recognition Mode Selection"
              >
                <option value="webcam">Live Webcam Recognition (Interactive)</option>
                <option value="video_upload">Benchmark Dataset Video Test (94.3% Model Accuracy)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <main className="main-content">
        {/* Left Column: Webcam Stream or Video Benchmark Upload */}
        {activeTab === 'webcam' ? (
          <WebcamView
            extractKeypoints={extractKeypoints}
            onGestureComplete={handleGestureComplete}
            onContinuousKeypoint={handleContinuousKeypoint}
            mpReady={mpReady}
            mpLoading={mpLoading}
            isStreaming={isStreaming}
            setIsStreaming={setIsStreaming}
            recognitionMode={recognitionMode}
            setRecognitionMode={setRecognitionMode}
            predictionData={prediction}
            confidenceThreshold={confidenceThreshold}
            onAddToSentence={(info) => {
              setSentence((prev) => [...prev, info]);
            }}
          />
        ) : (
          <VideoUploadView
            selectedModel={selectedModel}
            onModelChange={setSelectedModel}
            onPredictionReceived={(pred) => {
              setPrediction(pred);
              if (pred.confidence >= confidenceThreshold) {
                const info = getClassInfo(pred.prediction);
                setSentence((prev) => [...prev, info]);
              }
            }}
            onAddToSentence={(info) => {
              setSentence((prev) => [...prev, info]);
            }}
          />
        )}

        {/* Right Column: AI Predictions, Softmax Probabilities, and Sentence Builder */}
        <PredictionPanel
          predictionData={prediction}
          confidenceThreshold={confidenceThreshold}
          sentence={sentence}
          setSentence={setSentence}
          selectedModel={selectedModel}
          onModelChange={setSelectedModel}
          onReloadModels={handleReloadModels}
        />
      </main>

      {/* 100 Sign Language Classes Dictionary Modal */}
      <GlossaryModal
        isOpen={isGlossaryOpen}
        onClose={() => setIsGlossaryOpen(false)}
      />
    </div>
  );
}
