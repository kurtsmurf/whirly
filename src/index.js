// @ts-check

// Randomize hue
document.documentElement.style.setProperty("--hue", `${Math.random() * 360}`);

// Update rotation on slider input
document.querySelector("#rotation-range").addEventListener("input", (e) => {
  // @ts-ignore: must cast e.target to HTMLInputElement
  const val = parseFloat(e.target.value);
  bufferSource?.playbackRate.setValueAtTime(val, audioContext.currentTime);
});

// playback position hack:
// https://github.com/WebAudio/web-audio-api/issues/2397#issuecomment-459514360

const audioContext = new AudioContext();

let bufferSource;
let timelineReader;

const connectFile = () => {
  document.documentElement.removeEventListener("click", connectFile);
  fetch("./wheh.mp3")
    .then((response) => response.arrayBuffer())
    .then((arrayBuffer) => audioContext.decodeAudioData(arrayBuffer))
    .then((audioBuffer) => {

      const spicyBuffer = audioContext.createBuffer(
        3,
        audioBuffer.length,
        audioBuffer.sampleRate,
      );

      const timeline = new Float32Array(audioBuffer.length);
      timeline.forEach((_, i) => timeline[i] = i / timeline.length);

      spicyBuffer.copyToChannel(audioBuffer.getChannelData(0), 0);
      spicyBuffer.copyToChannel(audioBuffer.getChannelData(1), 1);
      spicyBuffer.copyToChannel(timeline, 2);

      bufferSource = audioContext.createBufferSource();
      bufferSource.buffer = spicyBuffer;
      bufferSource.loop = true;
      bufferSource.start();

      const splitter = audioContext.createChannelSplitter();
      const merger = audioContext.createChannelMerger();

      bufferSource.connect(splitter);

      splitter.connect(merger, 0, 0);
      splitter.connect(merger, 1, 1);

      timelineReader = audioContext.createAnalyser();
      splitter.connect(timelineReader, 2);

      merger.connect(audioContext.destination);

      tick();
    });
};

document.documentElement.addEventListener("click", connectFile);

const sampleHolder = new Float32Array(1);

const tick = () => {
  timelineReader.getFloatTimeDomainData(sampleHolder);
  const [progress] = sampleHolder;

  const rotation = `${progress * 360}deg`;
  document.documentElement.style.setProperty("--rotation", rotation);
  requestAnimationFrame(tick);
};
