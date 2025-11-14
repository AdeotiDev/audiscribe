import { useState, useEffect, useRef, useCallback } from 'react';
// FIX: The `LiveSession` type is not exported by the `@google/genai` package.
// It has been removed from this import statement.
import { GoogleGenAI, LiveServerMessage, Modality, Blob as GenAIBlob } from "@google/genai";

// FIX: A local `LiveSession` interface is defined here to provide type safety
// for the object returned by `ai.live.connect()`, as it's not exported from the library.
interface LiveSession {
  sendRealtimeInput(input: { media: GenAIBlob }): void;
  close(): void;
}

// Helper function to encode audio bytes to base64
function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Helper function for linear resampling of audio
function resample(buffer: Float32Array, fromSampleRate: number, toSampleRate: number): Float32Array {
  if (fromSampleRate === toSampleRate) {
    return buffer;
  }

  const sampleRateRatio = fromSampleRate / toSampleRate;
  const newLength = Math.round(buffer.length / sampleRateRatio);
  const result = new Float32Array(newLength);

  for (let i = 0; i < newLength; i++) {
    const index = i * sampleRateRatio;
    const indexFloor = Math.floor(index);
    const indexCeil = indexFloor + 1;
    const fraction = index - indexFloor;

    if (indexCeil < buffer.length) {
      const value1 = buffer[indexFloor];
      const value2 = buffer[indexCeil];
      result[i] = value1 + (value2 - value1) * fraction;
    } else {
      result[i] = buffer[indexFloor];
    }
  }
  return result;
}


// Helper function to create a Gemini API-compatible Blob from raw audio data
function createBlob(data: Float32Array): GenAIBlob {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    // Clamp values to avoid distortion
    int16[i] = Math.max(-32768, Math.min(32767, data[i] * 32768));
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}

export const useSpeechToText = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);

  const sessionPromiseRef = useRef<Promise<LiveSession> | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

  const stopListening = useCallback(() => {
    // This function is now stable and doesn't depend on `isListening` state
    // ensuring it can be safely used in callbacks without stale closures.
    // It's designed to be idempotent and clean up all resources.
    setIsListening(false);

    if (sessionPromiseRef.current) {
      sessionPromiseRef.current.then(session => session.close()).catch(console.error);
      sessionPromiseRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (mediaStreamSourceRef.current) {
      mediaStreamSourceRef.current.disconnect();
      mediaStreamSourceRef.current = null;
    }
    if (scriptProcessorRef.current) {
      scriptProcessorRef.current.disconnect();
      scriptProcessorRef.current.onaudioprocess = null;
      scriptProcessorRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(console.error);
      audioContextRef.current = null;
    }
  }, []);
  
  const startListening = async ({ continueTranscript = false } = {}) => {
    if (isListening) return;

    if (!continueTranscript) {
        setTranscript('');
    }
    setError(null);

    const API_KEY = process.env.API_KEY;
    if (!API_KEY) {
      setError("API key not configured. Speech recognition is disabled.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const ai = new GoogleGenAI({ apiKey: API_KEY });
      
      const audioContext = new ((window as any).AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioContext;

      const TARGET_SAMPLE_RATE = 16000;

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            setIsListening(true);
            const source = audioContext.createMediaStreamSource(stream);
            mediaStreamSourceRef.current = source;
            
            const scriptProcessor = audioContext.createScriptProcessor(4096, 1, 1);
            scriptProcessorRef.current = scriptProcessor;

            scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
              const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
              const inputSampleRate = audioProcessingEvent.inputBuffer.sampleRate;
              
              const resampledData = resample(inputData, inputSampleRate, TARGET_SAMPLE_RATE);
              const pcmBlob = createBlob(resampledData);

              sessionPromise.then((session) => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(audioContext.destination);
          },
          onmessage: (message: LiveServerMessage) => {
            if (message.serverContent?.inputTranscription) {
              const text = message.serverContent.inputTranscription.text;
              setTranscript(prev => prev + text);
            }
          },
          onerror: (e: ErrorEvent) => {
            console.error("Gemini Live API Error:", e);
            setError('A network error occurred. You can continue recording.');
            stopListening();
          },
          onclose: (e: CloseEvent) => {
             // A non-1000 code indicates an unexpected closure.
            if (e.code !== 1000 && !e.wasClean) {
               setError('Recording session closed unexpectedly. You can continue from where you left off.');
            }
            stopListening();
          },
        },
        config: {
          responseModalities: [Modality.AUDIO],
          inputAudioTranscription: {},
        },
      });
      sessionPromiseRef.current = sessionPromise;

    } catch (err) {
      console.error("Error starting speech recognition:", err);
      setError('Failed to start speech recognition. Please check microphone permissions.');
      setIsListening(false);
    }
  };

  const setFullTranscript = useCallback((text: string) => {
    setTranscript(text);
  }, []);
  
  useEffect(() => {
    // Component unmount cleanup
    return () => {
      stopListening();
    };
  }, [stopListening]);

  return {
    isListening,
    transcript,
    error,
    startListening,
    stopListening,
    setFullTranscript,
    setError,
  };
};
