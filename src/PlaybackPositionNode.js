// playback position hack:
// https://github.com/WebAudio/web-audio-api/issues/2397#issuecomment-459514360

// composite audio node:
// https://github.com/GoogleChromeLabs/web-audio-samples/wiki/CompositeAudioNode


export class PlaybackPositionNode {
  constructor(context) {
    this.context = context;
    this._bufferSource = context.createBufferSource();
    this._analyser = context.createAnalyser();
    this._sampleHolder = new Float32Array(1);
    this._splitter = context.createChannelSplitter();
    this._output = context.createChannelMerger();

    this._bufferSource.connect(this._splitter);
    this._splitter.connect(this._output, 0, 0);
    this._splitter.connect(this._output, 1, 1);
    this._splitter.connect(this._analyser, 2);
  }

  get playbackPosition() {
    this._analyser.getFloatTimeDomainData(this._sampleHolder);
    return this._sampleHolder[0];
  }

  get buffer() {
    return this._buffer;
  }

  set buffer(audioBuffer) {
    const timeline = new Float32Array(audioBuffer.length);
    timeline.forEach((_, i) => timeline[i] = i / timeline.length);

    this._buffer = audioBuffer;
    this._bufferSource.buffer = this.context.createBuffer(
      3,
      audioBuffer.length,
      audioBuffer.sampleRate,
    );
    this._bufferSource.buffer.copyToChannel(audioBuffer.getChannelData(0), 0);
    this._bufferSource.buffer.copyToChannel(audioBuffer.getChannelData(1), 1);
    this._bufferSource.buffer.copyToChannel(timeline, 2);
  }

  get loop() {
    return this._bufferSource.loop;
  }

  set loop(val) {
    this._bufferSource.loop = val;
  }

  get playbackRate() {
    return this._bufferSource.playbackRate;
  }

  start(...args) {
    this._bufferSource.start(...args);
  }

  connect(...args) {
    this._output.connect(...args);
  }

  disconnect(...args) {
    this._output.disconnect(...args);
  }
}
