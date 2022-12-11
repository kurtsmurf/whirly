// @ts-check

import { PlaybackPositionNode } from "./PlaybackPositionNode.js";

const audioContext = new AudioContext();
let bufferSource;

// wire up range slider to playback rate
{
  const floatOfEvent = (e) => parseFloat(e.target.value);

  const updatePlaybackRate = (rate) =>
    bufferSource?.playbackRate.setValueAtTime(rate, audioContext.currentTime);

  document
    .querySelector("#rotation-range")
    .addEventListener("input", (e) => updatePlaybackRate(floatOfEvent(e)));
}

// wire up playback position to rotation of indicator
{
  const updateRotation = () => {
    document.documentElement.style.setProperty(
      "--rotation",
      `${bufferSource?.playbackPosition * 360}deg`,
    );
  };

  const tick = () => {
    updateRotation();
    requestAnimationFrame(tick);
  };

  tick();
}

// load file and start
{
  const nodeOfAudioBuffer = (audioBuffer) => {
    const ppNode = new PlaybackPositionNode(audioContext);
    ppNode.buffer = audioBuffer;
    ppNode.loop = true;
    return ppNode;
  };

  const start = (audioBuffer) => {
    bufferSource = nodeOfAudioBuffer(audioBuffer);
    bufferSource.connect(audioContext.destination);
    bufferSource.start();
  };

  const audioBufferOfResponse = (response) =>
    response
      .arrayBuffer()
      .then((arrayBuffer) => audioContext.decodeAudioData(arrayBuffer));

  const loadAndPlayAudio = () =>
    fetch("./wheh.mp3").then(audioBufferOfResponse).then(start);

  const init = () => {
    document.documentElement.removeEventListener("click", init);
    loadAndPlayAudio();
  };

  document.documentElement.addEventListener("click", init);
}

// randomizing hue
document.documentElement.style.setProperty("--hue", `${Math.random() * 360}`);
