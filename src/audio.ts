export let audioContext: AudioContext;
export let gainNode: GainNode;
let tempo: number;
let playInterval: number;
let quantize: number;
let isStarted = false;

export type Audio = {
  buffer: AudioBuffer;
  source: AudioBufferSourceNode;
  gainNode: GainNode;
  isPlaying: boolean;
  playedTime: number;
  isReady: boolean;
  isLooping: boolean;
};

const audios: { [key: string]: Audio } = {};

export function play(name: string, _volume: number = 1): boolean {
  const audio = audios[name];
  if (audio == null) {
    return false;
  }
  audio.gainNode.gain.value = _volume;
  audio.isPlaying = true;
  return true;
}

export function update() {
  const currentTime = audioContext.currentTime;
  for (const name in audios) {
    const audio = audios[name];
    if (!audio.isReady || !audio.isPlaying) {
      continue;
    }
    audio.isPlaying = false;
    const time = getQuantizedTime(currentTime);
    if (audio.playedTime == null || time > audio.playedTime) {
      playLater(audio, time);
      audio.playedTime = time;
    }
  }
}

export function stop(name: string, when: number = undefined) {
  const audio = audios[name];
  if (audio.source == null) {
    return;
  }
  if (when == null) {
    audio.source.stop();
  } else {
    audio.source.stop(when);
  }
  audio.source = undefined;
}

export function init() {
  audioContext = new (window.AudioContext ||
    (window as any).webkitAudioContext)();
  gainNode = audioContext.createGain();
  gainNode.connect(audioContext.destination);
  setTempo();
  setQuantize();
  setVolume();
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      audioContext.suspend();
    } else {
      audioContext.resume();
    }
  });
}

export function loadAudioFile(key: string, url: string) {
  audios[key] = createAudioFromFile(url);
  return audios[key];
}

export function start() {
  if (isStarted) {
    return;
  }
  isStarted = true;
  resumeAudioContext();
}

export function setTempo(_tempo = 120) {
  tempo = _tempo;
  playInterval = 60 / tempo;
}

export function setQuantize(noteLength = 8) {
  quantize = noteLength > 0 ? 4 / noteLength : undefined;
}

export function setVolume(_volume = 0.1) {
  gainNode.gain.value = _volume;
}

function playLater(audio: Audio, when: number) {
  const bufferSourceNode = audioContext.createBufferSource();
  audio.source = bufferSourceNode;
  bufferSourceNode.buffer = audio.buffer;
  bufferSourceNode.loop = audio.isLooping;
  bufferSourceNode.start =
    bufferSourceNode.start || (bufferSourceNode as any).noteOn;
  bufferSourceNode.connect(audio.gainNode);
  bufferSourceNode.start(when);
}

function createAudioFromFile(url: string): Audio {
  const audio: Audio = {
    buffer: undefined,
    source: undefined,
    gainNode: audioContext.createGain(),
    isPlaying: false,
    playedTime: undefined,
    isReady: false,
    isLooping: false,
  };
  audio.gainNode.connect(gainNode);
  loadFile(url).then((buffer) => {
    audio.buffer = buffer;
    audio.isReady = true;
  });
  return audio;
}

async function loadFile(url: string): Promise<AudioBuffer> {
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
  return audioBuffer;
}

function getQuantizedTime(time: number) {
  if (quantize == null) {
    return time;
  }
  const interval = playInterval * quantize;
  return interval > 0 ? Math.ceil(time / interval) * interval : time;
}

function resumeAudioContext() {
  audioContext.resume();
}
