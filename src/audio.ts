export let audioContext: AudioContext;
export let gainNodeForAudioFiles: GainNode;
export let isAudioFilesEnabled = false;
let tempo: number;
let playInterval: number;
let quantize: number;

export type AudioFile = {
  buffer: AudioBuffer;
  source: AudioBufferSourceNode;
  gainNode: GainNode;
  isPlaying: boolean;
  playedTime: number;
  isReady: boolean;
  isLooping: boolean;
};

let audioFiles: { [key: string]: AudioFile } = {};

export function playAudioFile(name: string, _volume: number = 1): boolean {
  const af = audioFiles[name];
  if (af == null) {
    return false;
  }
  af.gainNode.gain.value = _volume;
  af.isPlaying = true;
  return true;
}

export function updateForAudioFiles() {
  const currentTime = audioContext.currentTime;
  for (const name in audioFiles) {
    const af = audioFiles[name];
    if (!af.isReady || !af.isPlaying) {
      continue;
    }
    af.isPlaying = false;
    const time = getQuantizedTime(currentTime);
    if (af.playedTime == null || time > af.playedTime) {
      playLater(af, time);
      af.playedTime = time;
    }
  }
}

export function stopAudioFile(name: string, when: number = undefined) {
  const af = audioFiles[name];
  if (af.source == null) {
    return;
  }
  if (when == null) {
    af.source.stop();
  } else {
    af.source.stop(when);
  }
  af.source = undefined;
}

export function stopAllAudioFiles(when: number = undefined) {
  if (!audioFiles) {
    return;
  }
  for (const name in audioFiles) {
    stopAudioFile(name, when);
  }
  audioFiles = {}
}

export function initAudioContext() {
  audioContext = new (window.AudioContext ||
    (window as any).webkitAudioContext)();
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      audioContext.suspend();
    } else {
      audioContext.resume();
    }
  });
}

export function initForAudioFiles() {
  isAudioFilesEnabled = true;
  gainNodeForAudioFiles = audioContext.createGain();
  gainNodeForAudioFiles.connect(audioContext.destination);
  setTempo();
  setQuantize();
  setVolume();
}

export function loadAudioFile(key: string, url: string) {
  audioFiles[key] = createBufferFromFile(url);
  return audioFiles[key];
}

export function setTempo(_tempo = 120) {
  tempo = _tempo;
  playInterval = 60 / tempo;
}

export function setQuantize(noteLength = 8) {
  quantize = noteLength > 0 ? 4 / noteLength : undefined;
}

export function setVolume(_volume = 0.1) {
  gainNodeForAudioFiles.gain.value = _volume;
}

function playLater(audio: AudioFile, when: number) {
  const bufferSourceNode = audioContext.createBufferSource();
  audio.source = bufferSourceNode;
  bufferSourceNode.buffer = audio.buffer;
  bufferSourceNode.loop = audio.isLooping;
  bufferSourceNode.start =
    bufferSourceNode.start || (bufferSourceNode as any).noteOn;
  bufferSourceNode.connect(audio.gainNode);
  bufferSourceNode.start(when);
}

function createBufferFromFile(url: string): AudioFile {
  const af: AudioFile = {
    buffer: undefined,
    source: undefined,
    gainNode: audioContext.createGain(),
    isPlaying: false,
    playedTime: undefined,
    isReady: false,
    isLooping: false,
  };
  af.gainNode.connect(gainNodeForAudioFiles);
  loadFile(url).then((buffer) => {
    af.buffer = buffer;
    af.isReady = true;
  });
  return af;
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
