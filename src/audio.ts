import { Random } from "./random";

declare const AlgoChip, AlgoChipUtil;
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
let audioSeed: number;
let audioVolume: number;

let isAlgoChipLibraryEnabled = false;
export let algoChipGainNode: GainNode;
export let algoChipSession;
let algoChipBgm;
let algoChipBgmSeed: number;
let algoChipSes = {};
let disposeVisibilityController;

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

export async function init(options: {
  audioSeed: number;
  audioVolume: number;
  audioTempo: number;
  bgmName: string;
  bgmVolume: number;
}) {
  audioSeed = options.audioSeed;
  audioVolume = options.audioVolume;
  bgmName = options.bgmName;
  bgmVolume = options.bgmVolume;
  if (
    typeof AlgoChip !== "undefined" &&
    AlgoChip !== null &&
    typeof AlgoChipUtil !== "undefined" &&
    AlgoChipUtil !== null
  ) {
    isAlgoChipLibraryEnabled = isSoundEnabled = true;
  } else if (typeof sss !== "undefined" && sss !== null) {
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
    setAudioFileVolume(0.1 * audioVolume);
    setAudioFileTempo(options.audioTempo);
    for (let audioName in audioFiles) {
      const a = loadAudioFile(audioName, audioFiles[audioName]);
      if (audioName === bgmName) {
        a.isLooping = true;
        isBgmAudioFileReady = true;
      }
    }
  }
  if (isAlgoChipLibraryEnabled) {
    algoChipGainNode = audioContext.createGain();
    algoChipGainNode.connect(audioContext.destination);
    algoChipSession = AlgoChipUtil.createAudioSession({
      audioContext,
      gainNode: algoChipGainNode,
      workletBasePath: "https://abagames.github.io/algo-chip/worklets/",
    });
    await algoChipSession.ensureReady();
    algoChipSession.setBgmVolume(0.5 * audioVolume);
    disposeVisibilityController =
      AlgoChipUtil.createVisibilityController(algoChipSession);
  }
  if (isSoundsSomeSoundsLibraryEnabled) {
    sssGainNode = audioContext.createGain();
    sssGainNode.connect(audioContext.destination);
    sss.init(audioSeed, audioContext, sssGainNode);
    sss.setVolume(0.1 * audioVolume);
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
  } else if (algoChipSession != null) {
    let t = type;
    let seed = audioSeed;
    if (t === "powerUp") {
      t = "powerup";
    } else if (t === "random" || t === "lucky") {
      t = "explosion";
      seed++;
    }
    let baseFrequency: number;
    if (options?.freq != null) {
      baseFrequency = options.freq;
    } else if (options?.pitch != null) {
      baseFrequency = 2 ** ((options.pitch - 69) / 12) * 440;
    }
    const seOptions = { seed, type: t, baseFrequency };
    const seKey = JSON.stringify(seOptions);
    if (algoChipSes[seKey] == null) {
      algoChipSes[seKey] = algoChipSession.generateSe(seOptions);
    }
    algoChipSession.playSe(algoChipSes[seKey], {
      volume:
        audioVolume * (options?.volume != null ? options?.volume : 1) * 0.7,
      duckingDb: -8,
      quantize: {
        loopAware: true,
        phase: "next",
        quantizeTo: "half_beat",
        fallbackTempo: 120,
      },
    });
  } else if (
    isSoundsSomeSoundsLibraryEnabled &&
    typeof sss.playSoundEffect === "function"
  ) {
    sss.playSoundEffect(type, options);
  } else if (isSoundsSomeSoundsLibraryEnabled) {
    sss.play(soundEffectTypeToString[type]);
  }
}

/** @ignore */
export function setSeed(seed: number) {
  audioSeed = seed;
  if (isSoundsSomeSoundsLibraryEnabled) {
    sss.setSeed(seed);
  }
}

/**
 * Play a background music
 */
/** @ignore */
export async function playBgm() {
  if (isBgmAudioFileReady && playAudioFile(bgmName, bgmVolume)) {
  } else if (algoChipSession != null) {
    if (algoChipBgm == null || algoChipBgmSeed != audioSeed) {
      algoChipBgmSeed = audioSeed;
      const random = new Random();
      random.setSeed(audioSeed);
      const calmEnergetic = random.get(-0.9, 0.9);
      const percussiveMelodic = random.get(-0.9, 0.9);
      algoChipBgm = await algoChipSession.generateBgm({
        seed: audioSeed,
        lengthInMeasures: 32,
        twoAxisStyle: { calmEnergetic, percussiveMelodic },
        overrides: {
          tempo: "medium",
        },
      });
    }
    algoChipSession.playBgm(algoChipBgm, { loop: true });
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
  } else if (algoChipSession != null) {
    algoChipSession.stopBgm();
  } else if (sssBgmTrack != null) {
    sss.stopMml(sssBgmTrack);
  } else if (isSoundsSomeSoundsLibraryEnabled) {
    sss.stopBgm();
  }
}

export function update() {
  if (isAudioFilesEnabled) {
    updateForAudioFiles();
  }
  if (isSoundsSomeSoundsLibraryEnabled) {
    sss.update();
  }
}

export function resume() {
  if (audioContext != null) {
    audioContext.resume();
  }
  if (algoChipSession != null) {
    algoChipSession.resumeAudioContext();
  }
}

export function unload() {
  if (isAudioFilesEnabled) {
    stopAllAudioFiles();
  }
  if (isAlgoChipLibraryEnabled) {
    disposeVisibilityController();
    if (algoChipSession != null) {
      algoChipSession.close();
    }
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

function updateForAudioFiles() {
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

function stopAllAudioFiles(when: number = undefined) {
  if (!audioFileStates) {
    return;
  }
  for (const name in audioFileStates) {
    stopAudioFile(name, when);
  }
  audioFileStates = {};
}

function initForAudioFiles() {
  isAudioFilesEnabled = true;
  gainNodeForAudioFiles = audioContext.createGain();
  gainNodeForAudioFiles.connect(audioContext.destination);
  setAudioFileTempo();
  setAudioFileQuantize();
  setAudioFileVolume();
}

function loadAudioFile(key: string, url: string) {
  audioFileStates[key] = createBufferFromFile(url);
  return audioFileStates[key];
}

function setAudioFileTempo(tempo = 120) {
  audioFilePlayInterval = 60 / tempo;
}

function setAudioFileQuantize(noteLength = 8) {
  audioFileQuantize = noteLength > 0 ? 4 / noteLength : undefined;
}

function setAudioFileVolume(_volume = 0.1) {
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
