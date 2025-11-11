declare const sss;
declare let audioFiles: { [key: string]: string };

/** Type of sound effects. */
export type SoundEffectType =
  | "coin"
  | "laser"
  | "explosion"
  | "powerUp"
  | "hit"
  | "jump"
  | "select"
  | "lucky"
  | "random"
  | "click"
  | "synth"
  | "tone";
const soundEffectTypeToString: { [key in SoundEffectType]: string } = {
  coin: "c",
  laser: "l",
  explosion: "e",
  powerUp: "p",
  hit: "h",
  jump: "j",
  select: "s",
  lucky: "u",
  random: "r",
  click: "i",
  synth: "y",
  tone: "t",
};

type AudioFileState = {
  buffer: AudioBuffer;
  source: AudioBufferSourceNode;
  gainNode: GainNode;
  isPlaying: boolean;
  playedTime: number;
  isReady: boolean;
  isLooping: boolean;
};

export let audioContext: AudioContext;
let isSoundEnabled = false;

export let isSoundsSomeSoundsLibraryEnabled = false;
export let sssGainNode: GainNode;
let sssBgmTrack;

export let isAudioFilesEnabled = false;
let isBgmAudioFileReady = false;
export let gainNodeForAudioFiles: GainNode;
let audioFilePlayInterval: number;
let audioFileQuantize: number;
let audioFileStates: { [key: string]: AudioFileState } = {};
let bgmName: string;
let bgmVolume: number;

export function init(options: {
  audioSeed: number;
  audioVolume: number;
  audioTempo: number;
  bgmName: string;
  bgmVolume: number;
}) {
  bgmName = options.bgmName;
  bgmVolume = options.bgmVolume;
  if (typeof sss !== "undefined" && sss !== null) {
    isSoundsSomeSoundsLibraryEnabled = isSoundEnabled = true;
  }
  if (typeof audioFiles !== "undefined" && audioFiles != null) {
    isAudioFilesEnabled = isSoundEnabled = true;
  }
  if (!isSoundEnabled) {
    return false;
  }
  audioContext = new (window.AudioContext ||
    (window as any).webkitAudioContext)();
  if (isAudioFilesEnabled) {
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        audioContext.suspend();
      } else {
        audioContext.resume();
      }
    });
    initForAudioFiles();
    setAudioFileVolume(0.1 * options.audioVolume);
    setAudioFileTempo(options.audioTempo);
    for (let audioName in audioFiles) {
      const a = loadAudioFile(audioName, audioFiles[audioName]);
      if (audioName === bgmName) {
        a.isLooping = true;
        isBgmAudioFileReady = true;
      }
    }
  }
  if (isSoundsSomeSoundsLibraryEnabled) {
    sssGainNode = audioContext.createGain();
    sssGainNode.connect(audioContext.destination);
    sss.init(options.audioSeed, audioContext, sssGainNode);
    sss.setVolume(0.1 * options.audioVolume);
    sss.setTempo(options.audioTempo);
  }
  return true;
}

export function play(
  type: SoundEffectType | string,
  options?: {
    seed?: number;
    numberOfSounds?: number;
    volume?: number;
    pitch?: number;
    freq?: number;
    note?: string;
  }
) {
  if (
    isAudioFilesEnabled &&
    playAudioFile(
      type,
      options != null && options.volume != null ? options.volume : 1
    )
  ) {
  } else if (
    isSoundsSomeSoundsLibraryEnabled &&
    typeof sss.playSoundEffect === "function"
  ) {
    sss.playSoundEffect(type, options);
  } else if (isSoundsSomeSoundsLibraryEnabled) {
    sss.play(soundEffectTypeToString[type]);
  }
}

/**
 * Play a background music
 */
/** @ignore */
export function playBgm() {
  if (isBgmAudioFileReady && playAudioFile(bgmName, bgmVolume)) {
  } else if (
    isSoundsSomeSoundsLibraryEnabled &&
    typeof sss.generateMml === "function"
  ) {
    sssBgmTrack = sss.playMml(sss.generateMml(), {
      volume: bgmVolume,
    });
  } else if (isSoundsSomeSoundsLibraryEnabled) {
    sss.playBgm();
  }
}

/**
 * Stop a background music
 */
/** @ignore */
export function stopBgm() {
  if (isBgmAudioFileReady) {
    stopAudioFile(bgmName);
  } else if (sssBgmTrack != null) {
    sss.stopMml(sssBgmTrack);
  } else if (isSoundsSomeSoundsLibraryEnabled) {
    sss.stopBgm();
  }
}

function playAudioFile(name: string, _volume: number = 1): boolean {
  const af = audioFileStates[name];
  if (af == null) {
    return false;
  }
  af.gainNode.gain.value = _volume;
  af.isPlaying = true;
  return true;
}

export function updateForAudioFiles() {
  const currentTime = audioContext.currentTime;
  for (const name in audioFileStates) {
    const af = audioFileStates[name];
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

function stopAudioFile(name: string, when: number = undefined) {
  const af = audioFileStates[name];
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
  if (!audioFileStates) {
    return;
  }
  for (const name in audioFileStates) {
    stopAudioFile(name, when);
  }
  audioFileStates = {};
}

export function initForAudioFiles() {
  isAudioFilesEnabled = true;
  gainNodeForAudioFiles = audioContext.createGain();
  gainNodeForAudioFiles.connect(audioContext.destination);
  setAudioFileTempo();
  setAudioFileQuantize();
  setAudioFileVolume();
}

export function loadAudioFile(key: string, url: string) {
  audioFileStates[key] = createBufferFromFile(url);
  return audioFileStates[key];
}

export function setAudioFileTempo(tempo = 120) {
  audioFilePlayInterval = 60 / tempo;
}

export function setAudioFileQuantize(noteLength = 8) {
  audioFileQuantize = noteLength > 0 ? 4 / noteLength : undefined;
}

export function setAudioFileVolume(_volume = 0.1) {
  gainNodeForAudioFiles.gain.value = _volume;
}

function playLater(audio: AudioFileState, when: number) {
  const bufferSourceNode = audioContext.createBufferSource();
  audio.source = bufferSourceNode;
  bufferSourceNode.buffer = audio.buffer;
  bufferSourceNode.loop = audio.isLooping;
  bufferSourceNode.start =
    bufferSourceNode.start || (bufferSourceNode as any).noteOn;
  bufferSourceNode.connect(audio.gainNode);
  bufferSourceNode.start(when);
}

function createBufferFromFile(url: string): AudioFileState {
  const af: AudioFileState = {
    buffer: undefined,
    source: undefined,
    gainNode: audioContext.createGain(),
    isPlaying: false,
    playedTime: undefined,
    isReady: false,
    isLooping: false,
  };
  af.gainNode.connect(gainNodeForAudioFiles);
  fetchAudioFile(url).then((buffer) => {
    af.buffer = buffer;
    af.isReady = true;
  });
  return af;
}

async function fetchAudioFile(url: string): Promise<AudioBuffer> {
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
  return audioBuffer;
}

function getQuantizedTime(time: number) {
  if (audioFileQuantize == null) {
    return time;
  }
  const interval = audioFilePlayInterval * audioFileQuantize;
  return interval > 0 ? Math.ceil(time / interval) * interval : time;
}
