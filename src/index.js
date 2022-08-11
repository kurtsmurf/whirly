// @ts-check

import { PlaybackPositionNode } from "./PlaybackPositionNode.js";

// Randomize hue
document.documentElement.style.setProperty("--hue", `${Math.random() * 360}`);

// Update rotation on slider input
document.querySelector("#rotation-range").addEventListener("input", (e) => {
  // @ts-ignore: must cast e.target to HTMLInputElement
  const val = parseFloat(e.target.value);
  bufferSource?.playbackRate.setValueAtTime(val, audioContext.currentTime);
});

const audioContext = new AudioContext();
let bufferSource;

const connectFile = () => {
  document.documentElement.removeEventListener("click", connectFile);
  fetch("./wheh.mp3")
    .then((response) => response.arrayBuffer())
    .then((arrayBuffer) => audioContext.decodeAudioData(arrayBuffer))
    .then((audioBuffer) => {
      bufferSource = new PlaybackPositionNode(audioContext);
      bufferSource.buffer = audioBuffer;
      bufferSource.loop = true;
      bufferSource.connect(audioContext.destination);
      bufferSource.start();

      tick();
    });
};

document.documentElement.addEventListener("click", connectFile);

const sampleHolder = new Float32Array(1);

const tick = () => {
  document.documentElement.style.setProperty(
    "--rotation",
    `${bufferSource.playbackPosition * 360}deg`
  );
  requestAnimationFrame(tick);
};
