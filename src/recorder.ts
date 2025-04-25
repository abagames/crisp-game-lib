const scale = 4;
const recordingFps = 60;
const mimeType = "video/webm;codecs=vp8,opus";
const type = "video/webm";
const fileName = "recording.webm";
const videoBitsPerSecond = 100000 * scale;
const masterVolume = 0.7;
let mediaRecorder: MediaRecorder;
let drawLoopFrameRequestId: number | undefined;

export function start(
  canvas: HTMLCanvasElement,
  audioContext: AudioContext,
  gainNodes: GainNode[]
) {
  if (mediaRecorder != null) {
    return;
  }
  const virtualCanvas = document.createElement("canvas");
  virtualCanvas.width = canvas.width * scale;
  virtualCanvas.height = canvas.height * scale;
  const context: CanvasRenderingContext2D = virtualCanvas.getContext("2d");
  context.imageSmoothingEnabled = false;
  const drawLoop = () => {
    context.drawImage(
      canvas,
      0,
      0,
      canvas.width,
      canvas.height,
      0,
      0,
      virtualCanvas.width,
      virtualCanvas.height
    );
    drawLoopFrameRequestId = requestAnimationFrame(drawLoop);
  };
  drawLoop();

  const stream = virtualCanvas.captureStream(recordingFps);
  const audioDestination = audioContext.createMediaStreamDestination();
  const gainNode = audioContext.createGain();
  gainNode.gain.value = masterVolume;
  gainNodes.forEach((gn) => {
    if (gn == null) {
      return;
    }
    gn.connect(gainNode);
  });
  gainNode.connect(audioDestination);
  const audioStream = audioDestination.stream;
  const combinedStream = new MediaStream([
    ...stream.getVideoTracks(),
    ...audioStream.getAudioTracks(),
  ]);
  mediaRecorder = new MediaRecorder(combinedStream, {
    mimeType,
    videoBitsPerSecond,
  });
  let recordedChunks = [];
  mediaRecorder.ondataavailable = (event) => {
    if (event.data.size > 0) {
      recordedChunks.push(event.data);
    }
  };
  mediaRecorder.onstop = () => {
    const blob = new Blob(recordedChunks, { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
    recordedChunks = [];
  };
  mediaRecorder.start();
}

export function stop() {
  if (mediaRecorder != null && mediaRecorder.state !== "inactive") {
    mediaRecorder.stop();
    mediaRecorder = undefined;
  }
  if (drawLoopFrameRequestId) {
    cancelAnimationFrame(drawLoopFrameRequestId);
    drawLoopFrameRequestId = undefined;
  }
}

export function isRecording() {
  return mediaRecorder != null && mediaRecorder.state === "recording";
}
