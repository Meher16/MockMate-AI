"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CameraMetrics, CameraMetricsSummary } from "@/types/camera";
import { createEmptyMetrics, summarizeMetrics } from "@/types/camera";
import { analyzeFaceLandmarks, resetHeadStabilityHistory } from "@/utils/face-analysis";

const WASM_CDN = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm";
const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task";

interface UseCameraMonitorOptions {
  enabled: boolean;
  recordVideo?: boolean;
}

export function useCameraMonitor({ enabled, recordVideo = false }: UseCameraMonitorOptions) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const landmarkerRef = useRef<unknown>(null);
  const rafRef = useRef<number>(0);
  const metricsHistoryRef = useRef<CameraMetrics[]>([]);
  const questionMetricsRef = useRef<CameraMetrics[]>([]);

  const [isActive, setIsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<CameraMetrics>(createEmptyMetrics());
  const [permissionDenied, setPermissionDenied] = useState(false);

  const stopCamera = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsActive(false);
  }, []);

  const detectLoop = useCallback(async () => {
    const video = videoRef.current;
    const landmarker = landmarkerRef.current as {
      detectForVideo: (video: HTMLVideoElement, ts: number) => {
        faceLandmarks?: Array<Array<{ x: number; y: number; z: number }>>;
      };
    } | null;

    if (!video || !landmarker || video.readyState < 2) {
      rafRef.current = requestAnimationFrame(detectLoop);
      return;
    }

    try {
      const result = landmarker.detectForVideo(video, performance.now());
      const faceCount = result.faceLandmarks?.length ?? 0;

      if (faceCount > 0 && result.faceLandmarks?.[0]) {
        const analyzed = analyzeFaceLandmarks(result.faceLandmarks[0], faceCount);
        setMetrics(analyzed);
        metricsHistoryRef.current.push(analyzed);
        questionMetricsRef.current.push(analyzed);
        if (metricsHistoryRef.current.length > 500) {
          metricsHistoryRef.current.shift();
        }
      } else {
        const empty = createEmptyMetrics();
        setMetrics(empty);
        questionMetricsRef.current.push(empty);
      }
    } catch {
      // Frame skip on detection error
    }

    rafRef.current = requestAnimationFrame(detectLoop);
  }, []);

  const startCamera = useCallback(async () => {
    if (!enabled || isActive) return;

    setIsLoading(true);
    setError(null);
    setPermissionDenied(false);
    resetHeadStabilityHistory();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      const { FaceLandmarker, FilesetResolver } = await import("@mediapipe/tasks-vision");

      const vision = await FilesetResolver.forVisionTasks(WASM_CDN);
      const faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: MODEL_URL,
          delegate: "GPU",
        },
        runningMode: "VIDEO",
        numFaces: 2,
        outputFaceBlendshapes: false,
        outputFacialTransformationMatrixes: false,
      });

      landmarkerRef.current = faceLandmarker;
      setIsActive(true);
      rafRef.current = requestAnimationFrame(detectLoop);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Camera access failed";
      if (message.includes("Permission") || message.includes("NotAllowed")) {
        setPermissionDenied(true);
        setError("Camera permission denied. Enable camera access to use monitoring.");
      } else {
        setError(message);
      }
      stopCamera();
    } finally {
      setIsLoading(false);
    }
  }, [enabled, isActive, detectLoop, stopCamera]);

  useEffect(() => {
    if (enabled) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [enabled]); // eslint-disable-line react-hooks/exhaustive-deps

  const resetQuestionMetrics = useCallback(() => {
    questionMetricsRef.current = [];
    resetHeadStabilityHistory();
  }, []);

  const getQuestionMetricsSummary = useCallback((): CameraMetricsSummary => {
    return summarizeMetrics(questionMetricsRef.current);
  }, []);

  const getSessionMetricsSummary = useCallback((): CameraMetricsSummary => {
    return summarizeMetrics(metricsHistoryRef.current);
  }, []);

  return {
    videoRef,
    isActive,
    isLoading,
    error,
    permissionDenied,
    metrics,
    recordVideo,
    startCamera,
    stopCamera,
    resetQuestionMetrics,
    getQuestionMetricsSummary,
    getSessionMetricsSummary,
  };
}
