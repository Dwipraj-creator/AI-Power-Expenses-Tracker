import { useState, useRef, useCallback, useEffect } from 'react';

const WAKE_WORD = 'jarvis';
const SILENCE_TIMEOUT = 1800; // ms of silence before a command is finalized
const INACTIVITY_TIMEOUT = 60000; // ms of no wake word before session auto-stops

export const useWakeWord = ({ onWake, onCommand }) => {
  const [sessionActive, setSessionActive] = useState(false);
  const [status, setStatus] = useState('idle'); // 'idle' | 'waiting-for-wake' | 'capturing'

  const recognitionRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const inactivityTimerRef = useRef(null);
  const commandBufferRef = useRef('');
  const sessionActiveRef = useRef(false); // mirrors sessionActive, safe to read inside callbacks

  const isSupported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;

  // --- stopSession defined first since other functions depend on it ---
  const stopSession = useCallback(() => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    sessionActiveRef.current = false;
    setSessionActive(false);
    setStatus('idle');
  }, []);

  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    inactivityTimerRef.current = setTimeout(() => {
      stopSession();
    }, INACTIVITY_TIMEOUT);
  }, [stopSession]);

  const resetSilenceTimer = useCallback(() => {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    silenceTimerRef.current = setTimeout(() => {
      setStatus('waiting-for-wake');
      const finalText = commandBufferRef.current.trim();
      commandBufferRef.current = '';
      if (finalText) onCommand?.(finalText);
    }, SILENCE_TIMEOUT);
  }, [onCommand]);

  const startCommandCapture = useCallback(
    (initialText = '') => {
      setStatus('capturing');
      commandBufferRef.current = initialText;
      onWake?.();
      resetInactivityTimer(); // real interaction happened — reset the auto-stop clock
      resetSilenceTimer();
    },
    [onWake, resetInactivityTimer, resetSilenceTimer]
  );

  const startSession = useCallback(() => {
    if (!isSupported) {
      alert('Speech recognition is not supported in this browser. Try Chrome.');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      const lastResult = event.results[event.results.length - 1];
      const transcript = lastResult[0].transcript.toLowerCase().trim();

      if (commandBufferRef.current || status === 'capturing') {
        commandBufferRef.current = transcript;
        resetSilenceTimer();
        return;
      }

      if (transcript.includes(WAKE_WORD)) {
        const afterWake = transcript.split(WAKE_WORD).pop().trim();
        startCommandCapture(afterWake);
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'not-allowed') {
        stopSession();
      }
    };

    recognition.onend = () => {
      // browser auto-stops recognition periodically — restart if session is still meant to be active
      if (sessionActiveRef.current) {
        recognition.start();
      }
    };

    recognition.start();
    recognitionRef.current = recognition;
    sessionActiveRef.current = true;
    setSessionActive(true);
    setStatus('waiting-for-wake');
    resetInactivityTimer();
  }, [isSupported, status, startCommandCapture, resetSilenceTimer, resetInactivityTimer, stopSession]);

  useEffect(() => {
    return () => stopSession(); // cleanup if component unmounts while session is active
  }, [stopSession]);

  return { sessionActive, status, startSession, stopSession, isSupported };
};