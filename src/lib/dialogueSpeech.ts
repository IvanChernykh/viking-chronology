let cachedVoice: SpeechSynthesisVoice | null = null;

function selectVoice(): SpeechSynthesisVoice | null {
  if (!('speechSynthesis' in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  const preferredPrefixes = ['is-IS', 'fo-FO', 'no-NO', 'sv-SE', 'da-DK'];
  for (const prefix of preferredPrefixes) {
    const voice = voices.find((candidate) => candidate.lang.toLowerCase().startsWith(prefix.toLowerCase()));
    if (voice) return voice;
  }
  return voices.find((voice) => voice.lang.toLowerCase().startsWith('is')) ?? voices[0] ?? null;
}

export function canSpeakDialogue(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
}

export function speakReconstructedNorse(text: string): void {
  if (!canSpeakDialogue()) return;
  window.speechSynthesis.cancel();
  cachedVoice = cachedVoice ?? selectVoice();
  const utterance = new SpeechSynthesisUtterance(text);
  if (cachedVoice) {
    utterance.voice = cachedVoice;
    utterance.lang = cachedVoice.lang;
  } else {
    utterance.lang = 'is-IS';
  }
  utterance.rate = 0.76;
  utterance.pitch = 0.78;
  utterance.volume = 0.95;
  window.speechSynthesis.speak(utterance);
}

export function stopDialogueSpeech(): void {
  if (canSpeakDialogue()) window.speechSynthesis.cancel();
}
