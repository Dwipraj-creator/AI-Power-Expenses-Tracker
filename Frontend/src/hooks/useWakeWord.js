import { useState, useRef, useCallback, useEffect } from 'react';

const WAKE_WORD = 'jarvis';
const SILENCE_TIMEOUT = 1800;
const INACTIVITY_TIMEOUT = 60000;
const CONFIRM_WORDS = ['yes', 'save', 'save it', 'save this', 'confirm', 'ok save', 'okay save', 'add this'];
const REJECT_WORDS = ['no', 'cancel', 'edit', 'redo', 'wrong', 'change it'];

const matchesWholeWord = (transcript, words) =>
  words.some((phrase) => new RegExp(`\\b${phrase}\\b`).test(transcript));

export const useWakeWord = ({ onWake, onCommand, onConfirm }) => {
  const [sessionActive, setSessionActive] = useState(false);
  const [status, setStatus] = useState('idle');

  const recognitionRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const inactivityTimerRef = useRef(null);
  const commandBufferRef = useRef('');
  const sessionActiveRef = useRef(false);

  // --- Refs that always hold the LATEST callbacks, so recognition.onresult never goes stale ---
  const onWakeRef = useRef(onWake);
  const onCommandRef = useRef(onCommand);
  const onConfirmRef = useRef(onConfirm);

  useEffect(() => { onWakeRef.current = onWake; }, [onWake]);
  useEffect(() => { onCommandRef.current = onCommand; }, [onCommand]);
  useEffect(() => { onConfirmRef.current = onConfirm; }, [onConfirm]);

  const isSupported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;

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
      if (finalText) onCommandRef.current?.(finalText); // read from ref, always current
    }, SILENCE_TIMEOUT);
  }, []);

  const startCommandCapture = useCallback(
    (initialText = '') => {
      setStatus('capturing');
      commandBufferRef.current = initialText;
      onWakeRef.current?.(); // read from ref, always current
      resetInactivityTimer();
      resetSilenceTimer();
    },
    [resetInactivityTimer, resetSilenceTimer]
  );

  const startConfirmationListening = useCallback(() => {
    setStatus('confirming');
    commandBufferRef.current = '__CONFIRMING__';
    resetInactivityTimer();
  }, [resetInactivityTimer]);

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

      if (commandBufferRef.current === '__CONFIRMING__') {
        const cleaned = transcript.startsWith(WAKE_WORD)
          ? transcript.slice(WAKE_WORD.length).trim()
          : transcript;

        const isReject = matchesWholeWord(cleaned, REJECT_WORDS);
        const isConfirm = matchesWholeWord(cleaned, CONFIRM_WORDS);

        if (isReject) {
          commandBufferRef.current = '';
          startCommandCapture('');
        } else if (isConfirm) {
          commandBufferRef.current = '';
          setStatus('waiting-for-wake');
          onConfirmRef.current?.(); // read from ref, always current — THE FIX
        }
        return;
      }

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
    return () => stopSession();
  }, [stopSession]);

  return {
    sessionActive,
    status,
    startSession,
    stopSession,
    isSupported,
    startConfirmationListening,
  };
};