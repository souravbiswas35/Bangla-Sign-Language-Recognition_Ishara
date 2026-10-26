import { useState, useEffect, useRef, useCallback } from 'react';

export default function useSignWebSocket(url = 'ws://localhost:8000/ws/predict') {
  const [status, setStatus] = useState('disconnected'); // 'connecting' | 'connected' | 'disconnected' | 'error'
  const [bufferedFrames, setBufferedFrames] = useState(0);
  const [prediction, setPrediction] = useState(null);
  const [latency, setLatency] = useState(0);

  const socketRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const lastSendTimeRef = useRef(0);
  const isUnmountedRef = useRef(false);

  const connect = useCallback(() => {
    if (socketRef.current && (socketRef.current.readyState === WebSocket.OPEN || socketRef.current.readyState === WebSocket.CONNECTING)) {
      return;
    }

    setStatus('connecting');
    try {
      const ws = new WebSocket(url);
      socketRef.current = ws;

      ws.onopen = () => {
        if (isUnmountedRef.current) return;
        setStatus('connected');
        console.log('[WS] Connected to sign recognition backend');
      };

      ws.onmessage = (event) => {
        if (isUnmountedRef.current) return;

        const roundtrip = performance.now() - lastSendTimeRef.current;
        if (roundtrip > 0 && roundtrip < 2000) {
          setLatency(Math.round(roundtrip));
        }

        try {
          const data = jsonParseSafe(event.data);
          if (!data) return;

          if (data.status === 'buffering') {
            setBufferedFrames(data.frames_buffered || 0);
          } else if (data.prediction) {
            setBufferedFrames(data.frames_buffered || 30);
            setPrediction({
              prediction: data.prediction,
              confidence: data.confidence,
              top5: data.top5 || [],
              model_used: data.model_used,
              timestamp: Date.now(),
            });
          }
        } catch (err) {
          console.error('[WS] Parse error:', err);
        }
      };

      ws.onerror = (err) => {
        if (isUnmountedRef.current) return;
        console.warn('[WS] Socket error:', err);
        setStatus('error');
      };

      ws.onclose = () => {
        if (isUnmountedRef.current) return;
        setStatus('disconnected');
        reconnectTimeoutRef.current = setTimeout(() => {
          if (!isUnmountedRef.current) connect();
        }, 3000);
      };
    } catch (err) {
      console.error('[WS] Init failed:', err);
      setStatus('disconnected');
    }
  }, [url]);

  function jsonParseSafe(str) {
    try {
      return JSON.parse(str);
    } catch {
      return null;
    }
  }

  useEffect(() => {
    isUnmountedRef.current = false;
    connect();

    return () => {
      isUnmountedRef.current = true;
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [connect]);

  // Send single frame
  const sendKeypoints = useCallback((keypoints, model = 'Transformer') => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      return false;
    }

    try {
      lastSendTimeRef.current = performance.now();
      socketRef.current.send(JSON.stringify({
        keypoints: Array.from(keypoints),
        model,
      }));
      return true;
    } catch (err) {
      console.error('[WS] Send error:', err);
      return false;
    }
  }, []);

  // Send complete 30-frame sequence (for 2.5-3.0s gesture capture)
  const sendSequence = useCallback((sequence30, model = 'Transformer') => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      return false;
    }

    try {
      lastSendTimeRef.current = performance.now();
      const rawArrays = sequence30.map((frame) => Array.from(frame));
      socketRef.current.send(JSON.stringify({
        keypoints: rawArrays,
        model,
      }));
      return true;
    } catch (err) {
      console.error('[WS] Send sequence error:', err);
      return false;
    }
  }, []);

  return {
    status,
    bufferedFrames,
    prediction,
    latency,
    sendKeypoints,
    sendSequence,
    setPrediction,
    reconnect: connect,
  };
}
