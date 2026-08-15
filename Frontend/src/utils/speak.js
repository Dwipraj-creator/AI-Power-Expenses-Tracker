const ACK_PHRASES = ['Yes?', "I'm listening", 'Go ahead', 'Yes, how can I help?'];

let cachedVoice = null;

// Call this once voices are loaded to pick a preferred one
const pickVoice = () => {
  if (!('speechSynthesis' in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;

  // Preference order — tweak this list to taste
 const preferredNames = [
  'Google UK English Male',
  'Microsoft Ravi - English (India)',
  'Microsoft George - English (United Kingdom)',
  'Google US English',
];

  for (const name of preferredNames) {
    const match = voices.find((v) => v.name === name);
    if (match) return match;
  }

  // fallback: any English voice
  return voices.find((v) => v.lang.startsWith('en')) || voices[0];
};

// Voices load asynchronously in some browsers — this ensures we grab them once ready
if ('speechSynthesis' in window) {
  window.speechSynthesis.onvoiceschanged = () => {
    cachedVoice = pickVoice();
  };
  cachedVoice = pickVoice(); // try immediately too, in case already loaded
}

export const speak = (text, { rate = 1, pitch = 1 } = {}) => {
  if (!('speechSynthesis' in window)) return;

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = rate;
  utterance.pitch = pitch;
  if (cachedVoice) utterance.voice = cachedVoice;

  window.speechSynthesis.speak(utterance);
};

export const speakAck = (username) => {
  const phrase = username
    ? `Yes,`
    : ACK_PHRASES[Math.floor(Math.random() * ACK_PHRASES.length)];
  speak(phrase, { rate: 1.05 });
};

export const stopSpeaking = () => {
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
};

// Utility so you can inspect what's actually available on your machine
export const listAvailableVoices = () => {
  if (!('speechSynthesis' in window)) return [];
  return window.speechSynthesis.getVoices().map((v) => ({ name: v.name, lang: v.lang }));
};