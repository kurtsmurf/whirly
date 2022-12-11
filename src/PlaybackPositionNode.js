// playback position hack:
// https://github.com/WebAudio/web-audio-api/issues/2397#issuecomment-459514360

// composite audio node:
// https://github.com/GoogleChromeLabs/web-audio-samples/wiki/CompositeAudioNode

export class PlaybackPositionNode {
  constructor(context) {
    this.context = context;
    this._bufferSource = new AudioBufferSourceNode(context);
    this._splitter = new ChannelSplitterNode(context);
    this._merger = new ChannelMergerNode(context);
    this._sampleHolder = new Float32Array(1);
  }

  get playbackPosition() {
    this._analyser?.getFloatTimeDomainData(this._sampleHolder);
    return this._sampleHolder[0];
  }

  get buffer() {
    return this._buffer;
  }

  set buffer(audioBuffer) {
    this._buffer = audioBuffer;
    this._bufferSource.buffer = new AudioBuffer({
      length: audioBuffer.length,
      sampleRate: audioBuffer.sampleRate,
      numberOfChannels: audioBuffer.numberOfChannels + 1,
    });

    for (let index = 0; index < audioBuffer.numberOfChannels; index++) {
      this._bufferSource.buffer.copyToChannel(
        audioBuffer.getChannelData(index),
        index,
      );
    }

    for (let index = 0; index < audioBuffer.length; index++) {
      this._bufferSource.buffer.getChannelData(audioBuffer.numberOfChannels)[
        index
      ] = index / audioBuffer.length;
    }

    this._bufferSource.connect(this._splitter);

    for (let index = 0; index < audioBuffer.numberOfChannels; index++) {
      this._splitter.connect(this._merger, index, index);
    }

    this._analyser = new AnalyserNode(this.context);
    this._splitter.connect(this._analyser, audioBuffer.numberOfChannels);
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
    this._merger.connect(...args);
  }

  disconnect(...args) {
    this._merger.disconnect(...args);
  }
}
