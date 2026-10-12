/**
 * Converts a Web Audio API AudioBuffer into a pristine 16-bit PCM WAV base64 string.
 * This guarantees 100% compatibility with Gemini API audio transcription and eliminates
 * any browser/codec/container issues (.m4a, .webm, .ogg, .aac).
 */
export function audioBufferToWavBase64(audioBuffer: AudioBuffer, targetSampleRate = 16000): string {
  const numChannels = 1; // 1 channel mono for speech
  const sourceSampleRate = audioBuffer.sampleRate;
  const channelData = audioBuffer.getChannelData(0);

  // Resample to targetSampleRate (16kHz is ideal for speech transcription models)
  const ratio = sourceSampleRate / targetSampleRate;
  // Cap at 180 seconds (3 mins) to keep payload within limits
  const maxSamples = targetSampleRate * 180;
  const newLength = Math.min(Math.round(channelData.length / ratio), maxSamples);
  const samples = new Int16Array(newLength);

  for (let i = 0; i < newLength; i++) {
    const srcIndex = Math.min(Math.round(i * ratio), channelData.length - 1);
    const s = Math.max(-1, Math.min(1, channelData[srcIndex]));
    // Scale float (-1.0 to 1.0) to 16-bit PCM integer
    samples[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }

  // Build standard RIFF/WAVE header (44 bytes)
  const dataSize = samples.length * 2;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  function writeString(offset: number, str: string) {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  }

  // RIFF Chunk
  writeString(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(8, 'WAVE');

  // fmt Subchunk
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
  view.setUint16(20, 1, true); // AudioFormat (1 = PCM)
  view.setUint16(22, numChannels, true); // NumChannels (1 = mono)
  view.setUint32(24, targetSampleRate, true); // SampleRate
  view.setUint32(28, targetSampleRate * numChannels * 2, true); // ByteRate
  view.setUint16(32, numChannels * 2, true); // BlockAlign
  view.setUint16(34, 16, true); // BitsPerSample

  // data Subchunk
  writeString(36, 'data');
  view.setUint32(40, dataSize, true);

  // Write PCM audio data
  let offset = 44;
  for (let i = 0; i < samples.length; i++) {
    view.setInt16(offset, samples[i], true);
    offset += 2;
  }

  // Convert ArrayBuffer to Base64 in safe chunks
  const bytes = new Uint8Array(buffer);
  let binary = '';
  const chunkSize = 8192;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, Math.min(i + chunkSize, bytes.length));
    binary += String.fromCharCode.apply(null, Array.from(chunk));
  }
  return btoa(binary);
}
