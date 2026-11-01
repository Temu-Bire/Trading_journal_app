"use client";

import { useState, useRef, useCallback } from "react";

export interface AudioRecordingResult {
  blob: Blob;
  dataUrl: string;
  durationSeconds: number;
}

export function useAudioRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioResult, setAudioResult] = useState<AudioRecordingResult | null>(null);
  const [recorderError, setRecorderError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef<number>(0);

  const startRecording = useCallback(async () => {
    setRecorderError(null);
    setAudioResult(null);
    chunksRef.current = [];

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setRecorderError("Microphone recording is not supported in this browser.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/mp4")
        ? "audio/mp4"
        : "";

      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
        const reader = new FileReader();
        reader.onloadend = () => {
          const duration = Math.round((Date.now() - startTimeRef.current) / 1000);
          setAudioResult({
            blob: audioBlob,
            dataUrl: reader.result as string,
            durationSeconds: Math.max(1, duration),
          });
        };
        reader.readAsDataURL(audioBlob);

        // Stop all media tracks to release microphone
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start(250); // collect chunks every 250ms
      startTimeRef.current = Date.now();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Microphone access error:", err);
      setRecorderError(
        err instanceof Error ? err.message : "Could not access microphone. Please grant permission."
      );
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {
        console.error("Error stopping recorder:", e);
      }
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [isRecording]);

  const clearAudio = useCallback(() => {
    setAudioResult(null);
    setRecordingTime(0);
    setRecorderError(null);
  }, []);

  return {
    isRecording,
    recordingTime,
    audioResult,
    recorderError,
    startRecording,
    stopRecording,
    clearAudio,
  };
}
