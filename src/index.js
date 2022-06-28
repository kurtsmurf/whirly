// @ts-check

// Randomize hue
document.documentElement.style.setProperty("--hue", `${Math.random() * 360}`);

// Update rotation on slider input
document.querySelector('#rotation-range').addEventListener('input', e => {
  // @ts-ignore: must cast e.target to HTMLInputElement
  const val = parseFloat(e.target.value);

  bufferSource?.playbackRate.setValueAtTime(val, audioContext.currentTime)
  positionBufferSource?.playbackRate.setValueAtTime(val, audioContext.currentTime)

})


// playback position hack:
// https://github.com/WebAudio/web-audio-api/issues/2397#issuecomment-459514360

const audioContext = new AudioContext();

let myAudioBuffer;
let positionBuffer;
let bufferSource;
let positionBufferSource;
let analyser;



const connectFile = () => {
  document.documentElement.removeEventListener('click', connectFile);
  fetch('./wheh.mp3')
    .then(response => response.arrayBuffer())
    .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer))
    .then(audioBuffer => {
      myAudioBuffer = audioBuffer;

      positionBuffer = new AudioBuffer({
        length: myAudioBuffer.length,
        sampleRate: myAudioBuffer.sampleRate,
        numberOfChannels: 1,
      })

      positionBuffer.copyToChannel(
        new Float32Array([...new Array(positionBuffer.length)]
          .map((_, i) => i / positionBuffer.length)),
        0
      )

      bufferSource = audioContext.createBufferSource()
      bufferSource.buffer = audioBuffer
      bufferSource.loop = true
      bufferSource.start()

      positionBufferSource = audioContext.createBufferSource()
      positionBufferSource.buffer = positionBuffer
      positionBufferSource.loop = true
      positionBufferSource.start()

      const cut = audioContext.createGain()
      cut.gain.value = 0

      analyser = audioContext.createAnalyser()

      bufferSource.connect(audioContext.destination)
      positionBufferSource
        .connect(analyser)
        .connect(cut)
        .connect(audioContext.destination)

      tick();
    })
}

document.documentElement.addEventListener('click', connectFile);

const tick = () => {
  const samples = new Float32Array(1);
  analyser.getFloatTimeDomainData(samples);

  const progress = samples[0];

  const rotation = `${progress * 360}deg`
  document.documentElement.style.setProperty('--rotation', rotation)
  requestAnimationFrame(tick);
}
