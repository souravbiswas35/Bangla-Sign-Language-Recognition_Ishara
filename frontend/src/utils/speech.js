/**
 * Production-Grade Text-to-Speech (TTS) for Bangla & English.
 *
 * Implements a robust multi-tier pronunciation architecture:
 *   Tier 1: High-Fidelity Native Bengali Neural Audio Stream (Google TTS)
 *           Produces authentic, fluent Bangladeshi pronunciation with natural tone,
 *           requiring zero local language packs or OS configuration.
 *   Tier 2: Web Speech API (Local / Cloud OS voices)
 *           Eagerly pre-loads and detects Bengali voices (Microsoft Bashkar, Google বাংলা, etc.).
 *   Tier 3: Graceful fallback with rate & pitch tuning.
 */

let currentAudio = null;
let cachedVoices = [];
let voicesLoaded = false;

// Pre-load voices as soon as browser is ready
function initVoices() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    const list = window.speechSynthesis.getVoices();
    if (list && list.length > 0) {
      cachedVoices = list;
      voicesLoaded = true;
    }
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = () => {
        cachedVoices = window.speechSynthesis.getVoices();
        voicesLoaded = true;
      };
    }
  }
}

initVoices();

/**
 * Cancel and stop any active speech or audio playback immediately.
 */
export function stopSpeech() {
  if (currentAudio) {
    try {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    } catch (_) {}
    currentAudio = null;
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch (_) {}
  }
}

/**
 * Speak text with accurate Bengali or English pronunciation.
 *
 * @param {string} text - The word or sentence to pronounce.
 * @param {string} lang - Preferred language code ('bn-BD', 'bn', 'en-US').
 * @param {object} options - Custom parameters:
 *   - preferOnline: boolean (default true for Bangla to guarantee 100% native accent)
 *   - rate: number (speed, default 0.95)
 *   - onStart: callback when speech begins
 *   - onEnd: callback when speech finishes
 */
export async function speakText(text, lang = 'bn-BD', options = {}) {
  if (!text || typeof window === 'undefined') return;

  const cleanText = String(text).trim();
  if (!cleanText) return;

  // Stop any overlapping audio first
  stopSpeech();

  const isBangla = lang.startsWith('bn') || /[\u0980-\u09FF]/.test(cleanText);

  // ── Tier 1: High-Fidelity Native Bengali Audio Stream ──────────────────
  // Google's Bengali TTS engine generates authentic Bangladeshi pronunciation.
  if (isBangla && options.preferOnline !== false) {
    try {
      const audioUrl = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=bn&q=${encodeURIComponent(cleanText)}`;
      const audio = new Audio(audioUrl);
      currentAudio = audio;

      if (options.onStart) {
        audio.addEventListener('play', options.onStart, { once: true });
      }
      if (options.onEnd) {
        audio.addEventListener('ended', options.onEnd, { once: true });
      }

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        await playPromise;
        return; // Successfully played natural Bengali audio!
      }
    } catch (err) {
      console.warn('Online Bengali TTS stream unavailable, falling back to Web Speech API:', err);
    }
  }

  // ── Tier 2: Web Speech API (Browser / OS Voices) ───────────────────────
  if ('speechSynthesis' in window) {
    try {
      if (!voicesLoaded || cachedVoices.length === 0) {
        cachedVoices = window.speechSynthesis.getVoices();
      }

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = options.rate || (isBangla ? 0.9 : 1.0);
      utterance.pitch = 1.0;
      utterance.lang = isBangla ? 'bn-BD' : 'en-US';

      if (options.onStart) utterance.onstart = options.onStart;
      if (options.onEnd) utterance.onend = options.onEnd;

      if (isBangla) {
        // Priority order for Bengali:
        // 1. Bangladeshi Bengali (bn-BD)
        // 2. Indian Bengali (bn-IN)
        // 3. Any voice labeled Bengali / Bangla / বাংলা
        const bdVoice = cachedVoices.find(v => v.lang === 'bn-BD' || v.lang === 'bn_BD');
        const inVoice = cachedVoices.find(v => v.lang === 'bn-IN' || v.lang === 'bn_IN' || v.lang.startsWith('bn'));
        const namedVoice = cachedVoices.find(v => /bengali|bangla|বাংলা/i.test(v.name));
        const matched = bdVoice || inVoice || namedVoice;

        if (matched) {
          utterance.voice = matched;
        }
      } else {
        const enVoice = cachedVoices.find(v => v.lang.startsWith('en'));
        if (enVoice) {
          utterance.voice = enVoice;
        }
      }

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.error('Web Speech API execution error:', err);
    }
  }
}
