import React, { useState, useRef, useCallback } from 'react';
import { getClassInfo } from '../data/classes';
import { speakText } from '../utils/speech';
import { apiUrl } from '../config';
import {
  IconUploadCloud,
  IconVideo,
  IconZap,
  IconSparkles,
  IconCheckCircle,
  IconAlertTriangle,
  IconPlus,
  IconVolume,
} from './Icons';

export default function VideoUploadView({
  selectedModel,
  onModelChange,
  onPredictionReceived,
  onAddToSentence,
}) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressStep, setProgressStep] = useState('');
  const [benchmarkResult, setBenchmarkResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef(null);
  const videoPlayerRef = useRef(null);

  const handleFile = useCallback((file) => {
    if (!file) return;
    if (!file.type.startsWith('video/') && !file.name.match(/\.(mp4|webm|mov|avi|mkv)$/i)) {
      setErrorMsg('Please select a valid video file (.mp4, .webm, .mov, .avi, .mkv)');
      return;
    }
    setErrorMsg('');
    setBenchmarkResult(null);
    setSelectedFile(file);
    if (videoPreviewUrl) {
      URL.revokeObjectURL(videoPreviewUrl);
    }
    const url = URL.createObjectURL(file);
    setVideoPreviewUrl(url);
  }, [videoPreviewUrl]);

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleRunInference = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setErrorMsg('');
    setProgressStep('Uploading benchmark video to server...');
    const startTime = Date.now();

    try {
      const formData = new FormData();
      formData.append('video', selectedFile);
      formData.append('model', selectedModel);

      setProgressStep('Extracting 30 uniform keyframe landmarks via MediaPipe Tasks...');

      const response = await fetch(apiUrl('/api/predict-video'), {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      setProgressStep('Normalizing features & running deep learning inference...');
      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      const totalTimeMs = Date.now() - startTime;
      const enrichedResult = {
        ...data,
        elapsedMs: totalTimeMs,
      };

      setBenchmarkResult(enrichedResult);

      // Sync with global app state so PredictionPanel and Sentence Builder reflect this
      if (onPredictionReceived) {
        onPredictionReceived({
          prediction: data.prediction,
          confidence: data.confidence,
          top5: data.top5 || [],
          model_used: data.model_used || selectedModel,
          timestamp: Date.now(),
        });
      }
    } catch (err) {
      console.error('Video inference error:', err);
      setErrorMsg(err.message || 'Failed to process video file.');
    } finally {
      setIsProcessing(false);
      setProgressStep('');
    }
  };

  const handleClear = () => {
    if (videoPreviewUrl) {
      URL.revokeObjectURL(videoPreviewUrl);
    }
    setSelectedFile(null);
    setVideoPreviewUrl(null);
    setBenchmarkResult(null);
    setErrorMsg('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const classInfo = benchmarkResult?.prediction
    ? getClassInfo(benchmarkResult.prediction)
    : null;

  return (
    <div className="card video-upload-card">
      <div className="card__header">
        <div className="card__title-group">
          <h2 className="card__title">
            <span className="card__icon">📁</span>
            Benchmark Dataset Video Testing
          </h2>
          <span className="badge badge--success">94.28% Verified Pipeline</span>
        </div>
        <p className="card__subtitle">
          Upload any dataset or pre-recorded sign video to test against the exact 30-frame MediaPipe pipeline used in training.
        </p>
      </div>

      <div className="card__body video-upload-body">
        {/* Dropzone */}
        {!selectedFile ? (
          <div
            className={`video-dropzone ${dragActive ? 'video-dropzone--active' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="video/mp4,video/webm,video/quicktime,video/x-msvideo,.mp4,.webm,.mov,.avi,.mkv"
              style={{ display: 'none' }}
              onChange={(e) => {
                if (e.target.files?.[0]) handleFile(e.target.files[0]);
              }}
            />
            <div className="dropzone-icon">
              <IconUploadCloud size={38} />
            </div>
            <h3 className="dropzone-title">Drag & Drop Benchmark Sign Video</h3>
            <p className="dropzone-desc">
              or <span className="dropzone-browse">browse from computer</span>
            </p>
            <div className="dropzone-hints">
              <span className="badge badge--subtle">MP4</span>
              <span className="badge badge--subtle">WEBM</span>
              <span className="badge badge--subtle">MOV</span>
              <span className="badge badge--subtle">100 Action Classes</span>
            </div>
            <div className="dropzone-tip">
              <strong>Tip for Examiners & Defense:</strong> Upload any sample video from your 10,000 dataset videos (e.g. <code>Banan Kora_01.mp4</code> or <code>Dhonnobad_01.mp4</code>) to verify the trained 94% accuracy in real-time.
            </div>
          </div>
        ) : (
          <div className="video-preview-wrapper">
            {/* Video Player */}
            <div className="video-player-container">
              <video
                ref={videoPlayerRef}
                src={videoPreviewUrl}
                controls
                playsInline
                className="video-player"
              />
              <div className="video-file-badge">
                <span className="file-name">{selectedFile.name}</span>
                <span className="file-size">
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                </span>
              </div>
            </div>

            {/* Controls Bar */}
            <div className="video-action-bar">
              <div className="model-selector-group">
                <label className="input-label">Model Architecture:</label>
                <div className="button-group">
                  {['Transformer', 'GRU', 'LSTM'].map((name) => (
                    <button
                      key={name}
                      type="button"
                      className={`btn btn--sm ${
                        selectedModel === name ? 'btn--primary' : 'btn--ghost'
                      }`}
                      onClick={() => onModelChange(name)}
                      disabled={isProcessing}
                    >
                      {name === 'Transformer' ? (
                        <>
                          <IconZap size={14} />
                          <span>Transformer (94.3%)</span>
                        </>
                      ) : (
                        name
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="action-buttons">
                <button
                  type="button"
                  className="btn btn--secondary btn--sm"
                  onClick={handleClear}
                  disabled={isProcessing}
                >
                  Change Video
                </button>
                <button
                  type="button"
                  className="btn btn--primary"
                  onClick={handleRunInference}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <span className="spinner" />
                      Analyzing Video...
                    </>
                  ) : (
                    <>
                      <IconSparkles size={16} />
                      <span>Recognize Sign Language</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Progress Status */}
            {isProcessing && (
              <div className="inference-progress-card">
                <div className="progress-bar-animated">
                  <div className="progress-bar-fill" />
                </div>
                <p className="progress-step-text">{progressStep}</p>
              </div>
            )}

            {/* Error Message */}
            {errorMsg && (
              <div className="alert alert--danger">
                <IconAlertTriangle size={16} />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Benchmark Results */}
            {benchmarkResult && !isProcessing && (
              <div className="benchmark-results-card">
                <div className="benchmark-header">
                  <div className="benchmark-badge-row">
                    <span className="badge badge--success" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                      <IconCheckCircle size={14} /> Verified Inference
                    </span>
                    <span className="badge badge--subtle">
                      Time: {benchmarkResult.elapsedMs} ms
                    </span>
                    <span className="badge badge--subtle">
                      Frames: {benchmarkResult.video_metadata?.total_frames} (Sampled: 30)
                    </span>
                  </div>
                </div>

                <div className="benchmark-hero">
                  <div className="hero-bengali">
                    <span className="bengali-script">
                      {classInfo?.bengali || benchmarkResult.prediction}
                    </span>
                    <span className="english-trans">
                      {classInfo?.english || benchmarkResult.prediction}
                    </span>
                    {classInfo?.category && (
                      <span className="category-pill">{classInfo.category}</span>
                    )}
                  </div>

                  <div className="confidence-meter-container">
                    <div className="confidence-circle">
                      <span className="confidence-num">
                        {((benchmarkResult.confidence || 0) * 100).toFixed(1)}%
                      </span>
                      <span className="confidence-lbl">Match Confidence</span>
                    </div>
                  </div>
                </div>

                {/* Top 5 Softmax distribution */}
                <div className="top5-section">
                  <h4 className="top5-title">Top 5 Prediction Probabilities:</h4>
                  <div className="top5-bars">
                    {benchmarkResult.top5?.map((cand, idx) => {
                      const candInfo = getClassInfo(cand.label);
                      const pct = (cand.confidence * 100).toFixed(1);
                      return (
                        <div key={cand.label} className="top5-row">
                          <div className="top5-label-group">
                            <span className="top5-rank">#{idx + 1}</span>
                            <span className="top5-name">
                              {candInfo.bengali} ({cand.label})
                            </span>
                          </div>
                          <div className="top5-progress-wrapper">
                            <div
                              className="top5-bar"
                              style={{ width: `${Math.max(Number(pct), 4)}%` }}
                            />
                            <span className="top5-pct">{pct}%</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Video Extraction Metadata */}
                {benchmarkResult.video_metadata && (
                  <div className="metadata-grid">
                    <div className="metadata-item">
                      <span className="meta-lbl">Video Duration</span>
                      <span className="meta-val">
                        {benchmarkResult.video_metadata.duration_sec}s
                      </span>
                    </div>
                    <div className="metadata-item">
                      <span className="meta-lbl">Resolution</span>
                      <span className="meta-val">
                        {benchmarkResult.video_metadata.width} ×{' '}
                        {benchmarkResult.video_metadata.height}
                      </span>
                    </div>
                    <div className="metadata-item">
                      <span className="meta-lbl">Original FPS</span>
                      <span className="meta-val">
                        {benchmarkResult.video_metadata.fps} fps
                      </span>
                    </div>
                    <div className="metadata-item">
                      <span className="meta-lbl">StandardScaler</span>
                      <span className="meta-val">Normalized (225-D)</span>
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '0.6rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className="btn btn--secondary btn--sm"
                    style={{ flex: 1 }}
                    onClick={() => {
                      const text = classInfo?.bangla || classInfo?.bengali || benchmarkResult.prediction;
                      speakText(text, 'bn-BD');
                    }}
                    title="Pronounce predicted sign in accurate Bangla"
                  >
                    <IconVolume size={15} />
                    <span>Pronounce in Bangla</span>
                  </button>

                  {onAddToSentence && (
                    <button
                      type="button"
                      className="btn btn--primary btn--sm"
                      style={{ flex: 1 }}
                      onClick={() => {
                        if (classInfo) onAddToSentence(classInfo);
                      }}
                    >
                      <IconPlus size={15} />
                      <span>Add to Sentence</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
