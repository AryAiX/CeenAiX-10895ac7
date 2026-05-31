import { useCallback, useEffect, useRef, useState } from 'react';

export type AudioRecorderStatus = 'idle' | 'requesting' | 'recording' | 'paused' | 'error';

export interface AudioInputDevice {
  deviceId: string;
  label: string;
}

export interface UseAudioRecorderResult {
  status: AudioRecorderStatus;
  elapsedSeconds: number;
  error: string | null;
  isSupported: boolean;
  devices: AudioInputDevice[];
  selectedDeviceId: string | null;
  stream: MediaStream | null;
  start: () => Promise<void>;
  pause: () => void;
  resume: () => void;
  stop: () => Promise<Blob | null>;
  reset: () => void;
  selectDevice: (deviceId: string) => void;
  refreshDevices: () => Promise<void>;
}

const pickSupportedMimeType = (): string | undefined => {
  if (typeof MediaRecorder === 'undefined') return undefined;
  const candidates = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/mp4'];
  return candidates.find((type) => MediaRecorder.isTypeSupported(type));
};

const detectSupport = (): boolean =>
  typeof navigator !== 'undefined' &&
  typeof navigator.mediaDevices !== 'undefined' &&
  typeof navigator.mediaDevices.getUserMedia === 'function' &&
  typeof MediaRecorder !== 'undefined';

/**
 * Wraps the Web Audio MediaRecorder API for consultation capture.
 * Handles permissions, device selection, pause/resume, and elapsed timing.
 */
export function useAudioRecorder(): UseAudioRecorderResult {
  const [status, setStatus] = useState<AudioRecorderStatus>('idle');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [devices, setDevices] = useState<AudioInputDevice[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const isSupported = detectSupport();

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stopResolverRef = useRef<((blob: Blob | null) => void) | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    clearTimer();
    timerRef.current = setInterval(() => {
      setElapsedSeconds((value) => value + 1);
    }, 1000);
  }, [clearTimer]);

  const teardownStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setStream(null);
  }, []);

  const refreshDevices = useCallback(async () => {
    if (!isSupported || typeof navigator.mediaDevices.enumerateDevices !== 'function') {
      return;
    }
    try {
      const all = await navigator.mediaDevices.enumerateDevices();
      const audioInputs = all
        .filter((device) => device.kind === 'audioinput')
        .map((device, index) => ({
          deviceId: device.deviceId,
          label: device.label || `Microphone ${index + 1}`,
        }));
      setDevices(audioInputs);
      setSelectedDeviceId((current) => current ?? audioInputs[0]?.deviceId ?? null);
    } catch {
      // Device enumeration is best-effort; ignore failures.
    }
  }, [isSupported]);

  const start = useCallback(async () => {
    if (!isSupported) {
      setStatus('error');
      setError('Audio recording is not supported in this browser.');
      return;
    }
    setError(null);
    setStatus('requesting');
    try {
      const constraints: MediaStreamConstraints = {
        audio: selectedDeviceId ? { deviceId: { exact: selectedDeviceId } } : true,
      };
      const nextStream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = nextStream;
      setStream(nextStream);
      void refreshDevices();

      const mimeType = pickSupportedMimeType();
      const recorder = new MediaRecorder(nextStream, mimeType ? { mimeType } : undefined);
      chunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };
      recorder.onstop = () => {
        const type = recorder.mimeType || mimeType || 'audio/webm';
        const blob = chunksRef.current.length ? new Blob(chunksRef.current, { type }) : null;
        teardownStream();
        clearTimer();
        if (stopResolverRef.current) {
          stopResolverRef.current(blob);
          stopResolverRef.current = null;
        }
      };
      mediaRecorderRef.current = recorder;
      recorder.start(1000);
      setElapsedSeconds(0);
      startTimer();
      setStatus('recording');
    } catch (err) {
      teardownStream();
      clearTimer();
      setStatus('error');
      const name = err instanceof DOMException ? err.name : '';
      if (name === 'NotAllowedError' || name === 'SecurityError') {
        setError('Microphone permission was denied. Allow microphone access and try again.');
      } else if (name === 'NotFoundError' || name === 'DevicesNotFoundError') {
        setError('No microphone was detected. Connect a microphone and try again.');
      } else {
        setError(err instanceof Error ? err.message : 'Could not start the microphone.');
      }
    }
  }, [isSupported, selectedDeviceId, refreshDevices, startTimer, teardownStream, clearTimer]);

  const pause = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state === 'recording') {
      recorder.pause();
      clearTimer();
      setStatus('paused');
    }
  }, [clearTimer]);

  const resume = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state === 'paused') {
      recorder.resume();
      startTimer();
      setStatus('recording');
    }
  }, [startTimer]);

  const stop = useCallback(async (): Promise<Blob | null> => {
    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state === 'inactive') {
      teardownStream();
      clearTimer();
      setStatus('idle');
      return null;
    }
    return new Promise<Blob | null>((resolve) => {
      stopResolverRef.current = resolve;
      try {
        recorder.stop();
      } catch {
        resolve(null);
      }
      setStatus('idle');
    });
  }, [teardownStream, clearTimer]);

  const reset = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== 'inactive') {
      stopResolverRef.current = null;
      try {
        recorder.stop();
      } catch {
        // ignore
      }
    }
    teardownStream();
    clearTimer();
    chunksRef.current = [];
    mediaRecorderRef.current = null;
    setElapsedSeconds(0);
    setError(null);
    setStatus('idle');
  }, [teardownStream, clearTimer]);

  const selectDevice = useCallback((deviceId: string) => {
    setSelectedDeviceId(deviceId);
  }, []);

  useEffect(() => {
    return () => {
      clearTimer();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [clearTimer]);

  return {
    status,
    elapsedSeconds,
    error,
    isSupported,
    devices,
    selectedDeviceId,
    stream,
    start,
    pause,
    resume,
    stop,
    reset,
    selectDevice,
    refreshDevices,
  };
}
