import * as input from "./input";
import { Vector } from "./vector";
import { Random } from "./random";
declare const cloneDeep;

type RecordedInput = {
  pos: Vector;
  isPressed: boolean;
  isJustPressed: boolean;
  isJustReleased: boolean;
};

export type Record = {
  randomSeed: number;
  inputs: RecordedInput[];
};

export type RewindState = {
  randomState: { x: number; y: number; z: number; w: number };
  gameState: any;
  baseState: { ticks: number; score: number };
};

let record: Record;
let inputIndex: number;
let rewindStates: RewindState[];
let storedInput: RecordedInput;

export function initRecord(randomSeed: number) {
  record = {
    randomSeed,
    inputs: [],
  };
}

export function recordInput(input: RecordedInput) {
  record.inputs.push(input);
}

export function isRecorded() {
  return record != null;
}

export function initReplay(random: Random) {
  inputIndex = 0;
  random.setSeed(record.randomSeed);
}

export function replayInput() {
  if (inputIndex >= record.inputs.length) {
    return;
  }
  input.set(record.inputs[inputIndex]);
  inputIndex++;
}

export function initRewind() {
  rewindStates = [];
}

export function saveRewindState(state: any, baseState, random: Random) {
  rewindStates.push({
    randomState: random.getState(),
    gameState: cloneDeep(state),
    baseState: cloneDeep(baseState),
  });
}

export function rewind(random: Random) {
  const rw = rewindStates.pop();
  const rs = rw.randomState;
  random.setSeed(rs.w, rs.x, rs.y, rs.z, 0);
  storedInput = {
    pos: vec(input.pos),
    isPressed: input.isPressed,
    isJustPressed: input.isJustPressed,
    isJustReleased: input.isJustReleased,
  };
  input.set(record.inputs.pop());
  return rw;
}

export function getLastRewindState(random: Random) {
  const rw = rewindStates[rewindStates.length - 1];
  const rs = rw.randomState;
  random.setSeed(rs.w, rs.x, rs.y, rs.z, 0);
  storedInput = {
    pos: vec(input.pos),
    isPressed: input.isPressed,
    isJustPressed: input.isJustPressed,
    isJustReleased: input.isJustReleased,
  };
  input.set(record.inputs[record.inputs.length - 1]);
  return rw;
}

export function restoreInput() {
  input.set(storedInput);
}

export function isRewindEmpty() {
  return rewindStates.length === 0;
}

export function getRewindStateForReplay() {
  const i = inputIndex - 1;
  if (i >= record.inputs.length) {
    return;
  }
  return rewindStates[i];
}
