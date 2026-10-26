import React, { useState } from 'react';
import { getClassInfo } from '../data/classes';
import { speakText } from '../utils/speech';
import {
  IconVolume,
  IconPlus,
  IconRefresh,
  IconBackspace,
  IconTrash,
  IconCopy,
  IconCheck,
  IconAlertTriangle,
} from './Icons';

export default function PredictionPanel({
  predictionData,
  confidenceThreshold,
  sentence,
  setSentence,
  selectedModel,
  onModelChange,
  onReloadModels,
}) {
  const [copied, setCopied] = useState(false);
  const [speakingWord, setSpeakingWord] = useState(false);
  const [speakingSentence, setSpeakingSentence] = useState(false);

  const prediction = predictionData?.prediction || null;
  const confidence = predictionData?.confidence ?? 0;
  const top5 = predictionData?.top5 || [];
  const modelUsed = predictionData?.model_used || selectedModel;

  const isModelMissing = prediction === 'No model loaded' || modelUsed?.includes('no model');
  const classInfo = prediction && !isModelMissing ? getClassInfo(prediction) : null;
  const isHighConfidence = confidence >= confidenceThreshold;

  // SVG Circular Confidence Ring math
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (confidence * circumference);
  const confidencePct = Math.round(confidence * 100);

  // Add word to continuous sentence
  const handleAddToSentence = (wordInfo) => {
    if (!wordInfo) return;
    setSentence((prev) => [...prev, wordInfo]);
  };

  const handlePronounceWord = () => {
    if (!classInfo) return;
    const text = classInfo.bangla || classInfo.bengali || classInfo.label;
    setSpeakingWord(true);
    speakText(text, 'bn-BD', {
      onEnd: () => setSpeakingWord(false),
    });
    setTimeout(() => setSpeakingWord(false), 3000);
  };

  const handleSpeakSentence = () => {
    if (sentence.length === 0) return;
    const textToSpeak = sentence.map((s) => s.bangla || s.bengali || s.label).join(' ');
    setSpeakingSentence(true);
    speakText(textToSpeak, 'bn-BD', {
      onEnd: () => setSpeakingSentence(false),
    });
    setTimeout(() => setSpeakingSentence(false), 6000);
  };

  const handleCopySentence = () => {
    if (sentence.length === 0) return;
    const text = sentence.map((s) => s.bangla || s.label).join(' ');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRemoveLast = () => {
    setSentence((prev) => prev.slice(0, -1));
  };

  const handleClearSentence = () => {
    setSentence([]);
  };

  return (
    <aside className="sidebar">
      {/* ── 1. Hero Live Prediction Card ── */}
      <div className="card">
        <div className="card__header">
          <span className="card__title">Real-Time Prediction</span>
          <div className="select-wrapper">
            <select
              value={selectedModel}
              onChange={(e) => onModelChange(e.target.value)}
              title="Select AI Architecture"
            >
              <option value="Transformer">Transformer (94.3%)</option>
              <option value="GRU">GRU (Lightweight)</option>
              <option value="LSTM">LSTM (Baseline)</option>
            </select>
          </div>
        </div>

        <div className="card__body prediction-hero">
          <div className="prediction-hero__label">
            {classInfo
              ? `${classInfo.category.toUpperCase()} · ${modelUsed}`
              : isModelMissing
              ? 'BACKEND WEIGHTS MISSING'
              : 'AWAITING VIDEO STREAM'}
          </div>

          {classInfo ? (
            <div>
              <div
                className="prediction-hero__word"
                style={{
                  fontFamily: 'var(--font-bengali)',
                  fontSize: '2.8rem',
                  marginBottom: '0.25rem',
                }}
              >
                {classInfo.bangla}
              </div>
              <div
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  letterSpacing: '0.01em',
                }}
              >
                {classInfo.label}
              </div>
              <div
                style={{
                  fontSize: '0.95rem',
                  color: 'var(--text-secondary)',
                  marginTop: '0.2rem',
                }}
              >
                "{classInfo.english}"
              </div>
            </div>
          ) : isModelMissing ? (
            <div style={{ padding: '1rem 0' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem', color: 'var(--accent-warning)', fontWeight: 700 }}>
                <IconAlertTriangle size={18} />
                <span>Model weights not detected</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.5rem 0 1rem' }}>
                Ensure weight files are in <code>backend/models/</code>
              </p>
              {onReloadModels && (
                <button className="btn btn--sm btn--primary" onClick={onReloadModels}>
                  <IconRefresh size={14} />
                  <span>Reload Models</span>
                </button>
              )}
            </div>
          ) : (
            <div className="prediction-hero__word" style={{ color: 'var(--text-muted)' }}>
              Ready
            </div>
          )}

          {/* Circular Confidence Meter */}
          <div className="prediction-hero__confidence">
            <div className="confidence-ring">
              <svg viewBox="0 0 52 52">
                <circle
                  className="confidence-ring__bg"
                  cx="26"
                  cy="26"
                  r={radius}
                />
                <circle
                  className="confidence-ring__fill"
                  cx="26"
                  cy="26"
                  r={radius}
                  strokeDasharray={circumference}
                  strokeDashoffset={isNaN(strokeDashoffset) ? circumference : strokeDashoffset}
                  style={{
                    stroke:
                      confidence >= 0.70
                        ? 'var(--accent-success)'
                        : confidence >= 0.40
                        ? 'var(--accent-warning)'
                        : 'var(--accent-danger)',
                  }}
                />
              </svg>
              <span className="confidence-ring__text">
                {confidencePct}%
              </span>
            </div>

            <div style={{ textAlign: 'left', marginLeft: '0.5rem' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 700 }}>
                {isHighConfidence ? 'Confident Match' : confidence > 0 ? 'Evaluating…' : 'Awaiting sign'}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Cutoff: {Math.round(confidenceThreshold * 100)}%
              </div>
            </div>
          </div>

          {classInfo && (
            <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'center', marginTop: '1.25rem' }}>
              <button
                className={`btn btn--sm ${speakingWord ? 'btn--primary' : 'btn--secondary'}`}
                onClick={handlePronounceWord}
                title="Pronounce in accurate Bangla"
              >
                <IconVolume size={14} />
                <span>{speakingWord ? 'Speaking…' : 'Pronounce'}</span>
              </button>
              <button
                className="btn btn--sm btn--primary"
                onClick={() => handleAddToSentence(classInfo)}
                title="Add word to sentence"
              >
                <IconPlus size={14} />
                <span>Add Word</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── 2. Top-5 Predictions Card ── */}
      <div className="card">
        <div className="card__header">
          <span className="card__title">Top 5 Candidates</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Softmax Probs</span>
        </div>
        <div className="card__body" style={{ padding: '0.85rem' }}>
          {top5.length > 0 ? (
            <ul className="top5-list">
              {top5.map((item, idx) => {
                const info = getClassInfo(item.label);
                const pct = Math.round(item.confidence * 100);
                return (
                  <li key={item.label + idx} className="top5-item">
                    <span className="top5-item__rank">{idx + 1}</span>
                    <div className="top5-item__label">
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                        <span style={{ fontWeight: 700 }}>{info.bangla}</span>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          ({info.label})
                        </span>
                      </div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                        "{info.english}"
                      </div>
                    </div>
                    <div className="top5-item__bar-wrapper">
                      <div
                        className="top5-item__bar"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="top5-item__pct">{pct}%</span>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', padding: '1.5rem' }}>
              Perform a sign to see top 5 probability ranking
            </div>
          )}
        </div>
      </div>

      {/* ── 3. Sentence Builder & Translation Log ── */}
      <div className="card">
        <div className="card__header">
          <span className="card__title">Constructed Sentence</span>
          <div style={{ display: 'flex', gap: '0.35rem' }}>
            {sentence.length > 0 && (
              <>
                <button
                  type="button"
                  className="btn btn--sm btn--secondary"
                  onClick={handleRemoveLast}
                  title="Remove last word"
                  style={{ padding: '0.35rem 0.55rem' }}
                >
                  <IconBackspace size={15} />
                </button>
                <button
                  type="button"
                  className="btn btn--sm btn--danger"
                  onClick={handleClearSentence}
                  title="Clear all words"
                  style={{ padding: '0.35rem 0.55rem' }}
                >
                  <IconTrash size={15} />
                </button>
              </>
            )}
          </div>
        </div>

        <div className="card__body">
          <div className="translation-log">
            {sentence.length > 0 ? (
              <div className="translation-log__sentence">
                {sentence.map((word, idx) => (
                  <span key={idx} title={word.english}>
                    {word.bangla || word.label}
                  </span>
                ))}
              </div>
            ) : (
              <div className="translation-log__empty">
                Recognized sign words will assemble here into a continuous Bangla sentence.
              </div>
            )}
          </div>

          {sentence.length > 0 && (
            <div
              style={{
                display: 'flex',
                gap: '0.6rem',
                marginTop: '1rem',
                justifyContent: 'flex-end',
              }}
            >
              <button
                type="button"
                className="btn btn--sm btn--secondary"
                onClick={handleCopySentence}
              >
                {copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
              <button
                type="button"
                className="btn btn--sm btn--primary"
                onClick={handleSpeakSentence}
                title="Read aloud sentence in accurate Bangla"
              >
                <IconVolume size={14} />
                <span>{speakingSentence ? 'Reading…' : 'Read Aloud'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
