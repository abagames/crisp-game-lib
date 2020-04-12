import * as input from "./input";
import { Vector } from "./vector";
import { Random } from "./random";

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

let record: Record;
let inputIndex: number;

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
