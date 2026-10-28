interface RecognitionResultEvent {
  results: ArrayLike<ArrayLike<{ transcript: string }>>;
}

interface Recognition {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((event: RecognitionResultEvent) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start(): void;
  stop(): void;
}

type RecognitionConstructor = new () => Recognition;

const PREFERENCE_KEY = "posygo.helper.voice";

export type VoicePreference = "on" | "off" | null;

function recognitionConstructor(): RecognitionConstructor | null {
  const scope = window as unknown as { SpeechRecognition?: RecognitionConstructor; webkitSpeechRecognition?: RecognitionConstructor };
  return scope.SpeechRecognition ?? scope.webkitSpeechRecognition ?? null;
}

export function canSpeak(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window && typeof SpeechSynthesisUtterance !== "undefined";
}

export function canListen(): boolean {
  return typeof window !== "undefined" && recognitionConstructor() !== null;
}

export function pageHasBeenUsed(): boolean {
  const activation = (navigator as Navigator & { userActivation?: { hasBeenActive: boolean } }).userActivation;
  return activation?.hasBeenActive ?? true;
}

export function readPreference(): VoicePreference {
  try {
    const value = window.localStorage.getItem(PREFERENCE_KEY);
    return value === "on" || value === "off" ? value : null;
  } catch {
    return null;
  }
}

export function savePreference(value: "on" | "off"): void {
  try {
    window.localStorage.setItem(PREFERENCE_KEY, value);
  } catch {
    return;
  }
}

export function spokenText(text: string): string {
  return text
    .replace(/^\s*[•\-]\s*/gm, "")
    .replace(/^\s*\d+\.\s*/gm, "")
    .replace(/[“”"]/g, "")
    .replace(/\bCASE-([A-Z0-9])([A-Z0-9]+)/g, (_match, first: string, rest: string) => `case ${[first, ...rest].join(" ")}`)
    .replace(/\s+/g, " ")
    .trim();
}

const FEMALE_NAMES =
  /libby|sonia|maisie|hazel|susan|zira|aria|jenny|michelle|emma|ava|samantha|karen|moira|tessa|serena|kate|stephanie|martha|fiona|victoria|allison|zoe|shelley|flo|sandy|catherine|female|woman|girl/i;
const MALE_NAMES = /\b(male|daniel|arthur|oliver|alex|fred|george|ryan|thomas|david|mark|guy|james|aaron|rishi|gordon|lee|reed|eddy|grandpa|ralph|albert|bruce|junior)\b/i;
const VOICE_KEY = "posygo.helper.voice-name";
const PITCH_FOR_FEMALE = 1.12;
const PITCH_FOR_FALLBACK = 1.35;

function isFemale(voice: SpeechSynthesisVoice): boolean {
  return FEMALE_NAMES.test(voice.name) && !MALE_NAMES.test(voice.name.replace(/female/gi, ""));
}

function englishVoices(): SpeechSynthesisVoice[] {
  return window.speechSynthesis.getVoices().filter((voice) => voice.lang.toLowerCase().startsWith("en"));
}

export function femaleVoices(): SpeechSynthesisVoice[] {
  if (!canSpeak()) {
    return [];
  }
  const rank = (voice: SpeechSynthesisVoice) => (voice.lang === "en-GB" ? 0 : 1) + (voice.localService ? 0 : 0.5);
  return englishVoices()
    .filter(isFemale)
    .sort((a, b) => rank(a) - rank(b));
}

export function readVoiceName(): string | null {
  try {
    return window.localStorage.getItem(VOICE_KEY);
  } catch {
    return null;
  }
}

export function saveVoiceName(name: string): void {
  try {
    window.localStorage.setItem(VOICE_KEY, name);
  } catch {
    return;
  }
}

function chosenVoice(): { voice: SpeechSynthesisVoice | undefined; pitch: number } {
  const female = femaleVoices();
  const saved = readVoiceName();
  const voice = female.find((entry) => entry.name === saved) ?? female[0];
  if (voice) {
    return { voice, pitch: PITCH_FOR_FEMALE };
  }
  const fallback = englishVoices().find((entry) => !MALE_NAMES.test(entry.name)) ?? englishVoices()[0];
  return { voice: fallback, pitch: PITCH_FOR_FALLBACK };
}

export function say(text: string, events: { onStart?: () => void; onEnd?: () => void } = {}): void {
  if (!canSpeak()) {
    return;
  }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(spokenText(text));
  const { voice, pitch } = chosenVoice();
  if (voice) {
    utterance.voice = voice;
  }
  utterance.lang = voice?.lang ?? "en-GB";
  utterance.pitch = pitch;
  utterance.rate = 1.02;
  utterance.onstart = () => events.onStart?.();
  utterance.onend = () => events.onEnd?.();
  utterance.onerror = () => events.onEnd?.();
  window.speechSynthesis.speak(utterance);
}

export function hush(): void {
  if (canSpeak()) {
    window.speechSynthesis.cancel();
  }
}

export function listen(onText: (text: string) => void, onDone: () => void): () => void {
  const Constructor = recognitionConstructor();
  if (!Constructor) {
    onDone();
    return () => undefined;
  }
  hush();
  const recognition = new Constructor();
  recognition.lang = "en-GB";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  recognition.onresult = (event) => {
    const transcript = event.results[0]?.[0]?.transcript.trim();
    if (transcript) {
      onText(transcript);
    }
  };
  recognition.onend = onDone;
  recognition.onerror = onDone;
  recognition.start();
  return () => recognition.stop();
}
