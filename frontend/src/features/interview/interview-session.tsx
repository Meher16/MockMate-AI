"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Send,
  Clock,
  CheckCircle2,
  Sparkles,
  Loader2,
  XCircle,
  Volume2,
  Camera,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageTransition } from "@/components/ui/motion";
import { VoiceAnswerPanel } from "@/features/interview/voice-answer-panel";
import { interviewService } from "@/services/interview.service";
import { feedbackService } from "@/services/feedback.service";
import { useToast } from "@/hooks/use-toast";
import { useSpeechSynthesis } from "@/hooks/use-speech-synthesis";
import { useSpeechRecognition } from "@/hooks/use-speech-recognition";
import { useCameraMonitor } from "@/hooks/use-camera-monitor";
import { getErrorMessage } from "@/lib/axios";
import type { Question, AnswerAnalysis, Interview } from "@/types/interview";
import { getDomainLabel, getDifficultyColor } from "@/types/interview";
import { cn } from "@/utils/cn";

const CameraMonitor = dynamic(
  () => import("@/features/interview/camera-monitor").then((m) => ({ default: m.CameraMonitor })),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-border/60 bg-muted/20">
        <p className="text-sm text-muted-foreground">Loading camera monitor...</p>
      </div>
    ),
  }
);

interface InterviewSessionProps {
  interviewId: string;
}

const VOICE_PREF_KEY = "ai-interviewer-voice-mode";
const CAMERA_PREF_KEY = "ai-interviewer-camera-enabled";
const RECORD_VIDEO_KEY = "ai-interviewer-record-video";

export function InterviewSession({ interviewId }: InterviewSessionProps) {
  const [interview, setInterview] = useState<Interview | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [answer, setAnswer] = useState("");
  const [rawTranscription, setRawTranscription] = useState("");
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [recordVideo, setRecordVideo] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [lastAnalysis, setLastAnalysis] = useState<AnswerAnalysis | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isGeneratingFeedback, setIsGeneratingFeedback] = useState(false);
  const [elapsedSec, setElapsedSec] = useState(0);
  const questionStartRef = useRef<number>(Date.now());
  const spokenQuestionIdRef = useRef<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  const { speak, stop: stopSpeaking, isSpeaking, isSupported: isSynthesisSupported } =
    useSpeechSynthesis();

  const handleTranscriptUpdate = useCallback((text: string) => {
    setRawTranscription(text);
    setAnswer(text);
  }, []);

  const {
    isListening,
    isSupported: isSpeechSupported,
    displayTranscript,
    error: speechError,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition({
    onFinalTranscript: handleTranscriptUpdate,
  });

  const {
    videoRef,
    isActive: isCameraActive,
    isLoading: isCameraLoading,
    error: cameraError,
    permissionDenied,
    metrics: cameraMetrics,
    startCamera,
    stopCamera,
    resetQuestionMetrics,
    getQuestionMetricsSummary,
  } = useCameraMonitor({ enabled: cameraEnabled && !isComplete && !isLoading, recordVideo });

  useEffect(() => {
    const savedVoice = localStorage.getItem(VOICE_PREF_KEY);
    const savedCamera = localStorage.getItem(CAMERA_PREF_KEY);
    const savedRecord = localStorage.getItem(RECORD_VIDEO_KEY);
    if (savedVoice !== null) setVoiceEnabled(savedVoice === "true");
    if (savedCamera !== null) setCameraEnabled(savedCamera === "true");
    if (savedRecord !== null) setRecordVideo(savedRecord === "true");
  }, []);

  useEffect(() => {
    localStorage.setItem(VOICE_PREF_KEY, String(voiceEnabled));
  }, [voiceEnabled]);

  useEffect(() => {
    localStorage.setItem(CAMERA_PREF_KEY, String(cameraEnabled));
  }, [cameraEnabled]);

  useEffect(() => {
    localStorage.setItem(RECORD_VIDEO_KEY, String(recordVideo));
  }, [recordVideo]);

  const initSession = useCallback(async () => {
    try {
      const data = await interviewService.get(interviewId);

      if (data.status === "COMPLETED") {
        setInterview(data);
        setIsComplete(true);
        setAnsweredCount(data.questions?.filter((q) => q.answer).length ?? 0);
        setTotalQuestions(data.questionCount);
        return;
      }

      if (data.status === "CANCELLED") {
        router.replace("/interview");
        return;
      }

      if (data.status === "IN_PROGRESS") {
        const current = await interviewService.getCurrent(interviewId);
        setInterview(current.interview);
        setCurrentQuestion(current.currentQuestion);
        setTotalQuestions(current.totalQuestions);
        setAnsweredCount(current.answeredCount);
        questionStartRef.current = Date.now();
        return;
      }

      setIsStarting(true);
      const started = await interviewService.start(interviewId);
      setInterview(started.interview);
      setCurrentQuestion(started.currentQuestion);
      setTotalQuestions(data.questionCount);
      setAnsweredCount(0);
      questionStartRef.current = Date.now();
    } catch (error) {
      toast({ title: "Failed to start interview", description: getErrorMessage(error), variant: "destructive" });
      router.replace("/interview");
    } finally {
      setIsLoading(false);
      setIsStarting(false);
    }
  }, [interviewId, router, toast]);

  useEffect(() => {
    initSession();
  }, [initSession]);

  useEffect(() => {
    if (isComplete || isLoading) return;
    const interval = setInterval(() => setElapsedSec((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, [isComplete, isLoading]);

  // Auto-speak question when it changes (voice mode)
  useEffect(() => {
    if (!voiceEnabled || !currentQuestion || showFeedback) return;
    if (spokenQuestionIdRef.current === currentQuestion.id) return;

    spokenQuestionIdRef.current = currentQuestion.id;
    stopListening();
    resetTranscript();
    setAnswer("");
    setRawTranscription("");

    const timer = setTimeout(() => {
      speak(currentQuestion.questionText);
    }, 400);

    return () => clearTimeout(timer);
  }, [currentQuestion, voiceEnabled, showFeedback, speak, stopListening, resetTranscript]);

  useEffect(() => {
    return () => {
      stopSpeaking();
      stopListening();
    };
  }, [stopSpeaking, stopListening]);

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const handleSubmit = async () => {
    if (!currentQuestion || !answer.trim()) return;

    stopListening();
    stopSpeaking();

    const timeTakenSec = Math.round((Date.now() - questionStartRef.current) / 1000);
    const cameraSummary = cameraEnabled ? getQuestionMetricsSummary() : undefined;
    setIsSubmitting(true);

    try {
      const result = await interviewService.submitAnswer(
        interviewId,
        currentQuestion.id,
        answer.trim(),
        timeTakenSec,
        voiceEnabled ? rawTranscription || answer.trim() : undefined,
        cameraSummary && cameraSummary.samples > 0 ? cameraSummary : undefined
      );

      setLastAnalysis(result.analysis);
      setShowFeedback(true);
      setAnsweredCount(result.answeredCount);
      setIsComplete(result.isComplete);

      if (result.isComplete) {
        setCurrentQuestion(null);
        stopCamera();
        setIsGeneratingFeedback(true);
        try {
          await feedbackService.generate(interviewId);
        } catch {
          // Feedback may already exist or generation can be retried from feedback page
        } finally {
          setIsGeneratingFeedback(false);
        }
      } else {
        setTimeout(() => {
          setCurrentQuestion(result.nextQuestion);
          resetTranscript();
          resetQuestionMetrics();
          setAnswer("");
          setRawTranscription("");
          setShowFeedback(false);
          questionStartRef.current = Date.now();
          spokenQuestionIdRef.current = null;
        }, 2500);
      }
    } catch (error) {
      toast({ title: "Submit failed", description: getErrorMessage(error), variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm("Cancel this interview? Progress will be lost.")) return;
    stopSpeaking();
    stopListening();
    stopCamera();
    setCameraEnabled(false);
    try {
      await interviewService.cancel(interviewId);
      router.push("/interview");
    } catch (error) {
      toast({ title: "Cancel failed", description: getErrorMessage(error), variant: "destructive" });
    }
  };

  const handleVoiceToggle = (enabled: boolean) => {
    setVoiceEnabled(enabled);
    if (!enabled) {
      stopListening();
      stopSpeaking();
    } else if (currentQuestion) {
      speak(currentQuestion.questionText);
    }
  };

  if (isLoading || isStarting) {
    return (
      <div className="container mx-auto px-4 py-20 flex flex-col items-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground">
          {isStarting ? "Generating your first question..." : "Loading interview..."}
        </p>
      </div>
    );
  }

  if (isComplete) {
    return (
      <PageTransition className="container mx-auto px-4 py-16 max-w-lg text-center">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <CheckCircle2 className="h-20 w-20 text-emerald-500 mx-auto mb-6" />
          <h1 className="text-3xl font-bold mb-2">Interview Complete!</h1>
          <p className="text-muted-foreground mb-2">
            You answered {answeredCount} of {totalQuestions} questions
          </p>
          {isGeneratingFeedback ? (
            <p className="text-sm text-muted-foreground mb-8 flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating your performance report...
            </p>
          ) : (
            <p className="text-sm text-muted-foreground mb-8">
              Your detailed feedback report is ready to review.
            </p>
          )}
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link href="/interview">
              <Button variant="outline">Back to Interviews</Button>
            </Link>
            <Link href={`/interview/${interviewId}/feedback`}>
              <Button variant="gradient" disabled={isGeneratingFeedback}>
                View Feedback Report
              </Button>
            </Link>
          </div>
        </motion.div>
      </PageTransition>
    );
  }

  const progress = totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;

  return (
    <PageTransition className="container mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between max-w-6xl mx-auto">
        <Link href="/interview">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" /> {formatTime(elapsedSec)}
          </span>
          <span>{getDomainLabel(interview?.domain)}</span>
          {voiceEnabled && (
            <Badge variant="secondary" className="gap-1">
              <Volume2 className="h-3 w-3" /> Voice
            </Badge>
          )}
          {cameraEnabled && isCameraActive && (
            <Badge variant="secondary" className="gap-1">
              <Camera className="h-3 w-3" /> Camera
            </Badge>
          )}
        </div>
        <Button variant="ghost" size="sm" onClick={handleCancel} className="text-destructive gap-1">
          <XCircle className="h-4 w-4" /> Cancel
        </Button>
      </div>

      <div className="space-y-2 max-w-6xl mx-auto">
        <div className="flex justify-between text-sm">
          <span className="font-medium">Question {answeredCount + 1} of {totalQuestions}</span>
          <span className="text-muted-foreground">{Math.round(progress)}% complete</span>
        </div>
        <div className="h-2 rounded-full bg-secondary overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3 max-w-6xl mx-auto">
        <div className="lg:col-span-2 space-y-6">
      <AnimatePresence mode="wait">
        {showFeedback && lastAnalysis ? (
          <motion.div
            key="feedback"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="border-emerald-500/30 bg-emerald-500/5">
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-emerald-500" />
                  <span className="font-semibold">Answer Analyzed</span>
                  <Badge variant="success" className="ml-auto">Score: {lastAnalysis.score}/10</Badge>
                </div>
                <p className="text-sm">{lastAnalysis.feedback}</p>
                {lastAnalysis.strengths.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-emerald-600 mb-1">Strengths</p>
                    <ul className="text-xs text-muted-foreground list-disc pl-4">
                      {lastAnalysis.strengths.map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                  </div>
                )}
                {!isComplete && (
                  <p className="text-xs text-muted-foreground animate-pulse">Loading next question...</p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ) : currentQuestion ? (
          <motion.div
            key={currentQuestion.id}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            className="space-y-6"
          >
            <Card className="glass-strong">
              <CardContent className="pt-8 pb-6 space-y-4">
                <div className="flex flex-wrap gap-2 items-center">
                  {currentQuestion.category && (
                    <Badge variant="secondary">{currentQuestion.category}</Badge>
                  )}
                  <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", getDifficultyColor(currentQuestion.difficulty))}>
                    {currentQuestion.difficulty}
                  </span>
                  {isSpeaking && (
                    <Badge variant="default" className="gap-1 animate-pulse">
                      <Volume2 className="h-3 w-3" /> Speaking...
                    </Badge>
                  )}
                </div>
                <p className="text-xl font-medium leading-relaxed">{currentQuestion.questionText}</p>
              </CardContent>
            </Card>

            <VoiceAnswerPanel
              answer={answer}
              onAnswerChange={setAnswer}
              displayTranscript={displayTranscript}
              isListening={isListening}
              isSpeechSupported={isSpeechSupported}
              isSynthesisSupported={isSynthesisSupported}
              isSpeaking={isSpeaking}
              voiceEnabled={voiceEnabled}
              onVoiceEnabledChange={handleVoiceToggle}
              onStartListening={startListening}
              onStopListening={stopListening}
              onSpeakQuestion={() => speak(currentQuestion.questionText)}
              onStopSpeaking={stopSpeaking}
              speechError={speechError}
              disabled={isSubmitting}
            />

            <div className="flex justify-end">
              <Button
                variant="gradient"
                onClick={handleSubmit}
                disabled={!answer.trim() || isSubmitting}
                isLoading={isSubmitting}
                className="gap-2"
              >
                <Send className="h-4 w-4" />
                Submit Answer
              </Button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
        </div>

        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-20">
            <CameraMonitor
              videoRef={videoRef}
              metrics={cameraMetrics}
              isActive={isCameraActive}
              isLoading={isCameraLoading}
              error={cameraError}
              permissionDenied={permissionDenied}
              enabled={cameraEnabled}
              onEnabledChange={setCameraEnabled}
              recordVideo={recordVideo}
              onRecordVideoChange={setRecordVideo}
              onRetry={startCamera}
            />
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
