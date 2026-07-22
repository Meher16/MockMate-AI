"use client";

import { Mic, MicOff, Volume2, VolumeX, Keyboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/utils/cn";

interface VoiceAnswerPanelProps {
  answer: string;
  onAnswerChange: (value: string) => void;
  displayTranscript: string;
  isListening: boolean;
  isSpeechSupported: boolean;
  isSynthesisSupported: boolean;
  isSpeaking: boolean;
  voiceEnabled: boolean;
  onVoiceEnabledChange: (enabled: boolean) => void;
  onStartListening: () => void;
  onStopListening: () => void;
  onSpeakQuestion: () => void;
  onStopSpeaking: () => void;
  speechError: string | null;
  disabled?: boolean;
}

export function VoiceAnswerPanel({
  answer,
  onAnswerChange,
  displayTranscript,
  isListening,
  isSpeechSupported,
  isSynthesisSupported,
  isSpeaking,
  voiceEnabled,
  onVoiceEnabledChange,
  onStartListening,
  onStopListening,
  onSpeakQuestion,
  onStopSpeaking,
  speechError,
  disabled,
}: VoiceAnswerPanelProps) {
  const wordCount = answer.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className="text-sm font-medium">Your Answer</label>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant={voiceEnabled ? "default" : "outline"}
            size="sm"
            onClick={() => onVoiceEnabledChange(!voiceEnabled)}
            className="gap-1.5 text-xs"
          >
            {voiceEnabled ? <Mic className="h-3.5 w-3.5" /> : <Keyboard className="h-3.5 w-3.5" />}
            {voiceEnabled ? "Voice Mode" : "Text Mode"}
          </Button>
          {voiceEnabled && isSynthesisSupported && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={isSpeaking ? onStopSpeaking : onSpeakQuestion}
              disabled={disabled}
              className="gap-1.5 text-xs"
            >
              {isSpeaking ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
              {isSpeaking ? "Stop" : "Replay Question"}
            </Button>
          )}
        </div>
      </div>

      {voiceEnabled && isListening && (
        <div className="rounded-xl border border-primary/40 bg-primary/5 p-4 space-y-2">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
            </span>
            <span className="text-sm font-medium text-primary">Listening...</span>
            <Badge variant="secondary" className="text-xs ml-auto">Live transcription</Badge>
          </div>
          <p className="text-sm text-muted-foreground min-h-[2rem] italic">
            {displayTranscript || "Start speaking — your words will appear here..."}
          </p>
        </div>
      )}

      {voiceEnabled && speechError && (
        <p className="text-xs text-destructive">
          Microphone error: {speechError}. You can still type your answer below.
        </p>
      )}

      {!isSpeechSupported && voiceEnabled && (
        <p className="text-xs text-amber-600 dark:text-amber-400">
          Speech recognition is not supported in this browser. Use Chrome or Edge for voice input, or switch to text mode.
        </p>
      )}

      <Textarea
        value={answer}
        onChange={(e) => onAnswerChange(e.target.value)}
        rows={8}
        placeholder={
          voiceEnabled
            ? "Speak using the microphone or edit the transcription here before submitting..."
            : "Type your answer here. Be specific and use examples where possible..."
        }
        disabled={disabled}
        className={cn(voiceEnabled && isListening && "ring-2 ring-primary/30")}
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs text-muted-foreground">{wordCount} words</span>

        {voiceEnabled && isSpeechSupported && (
          <Button
            type="button"
            variant={isListening ? "destructive" : "outline"}
            size="sm"
            onClick={isListening ? onStopListening : onStartListening}
            disabled={disabled}
            className="gap-2"
          >
            {isListening ? (
              <>
                <MicOff className="h-4 w-4" /> Stop Recording
              </>
            ) : (
              <>
                <Mic className="h-4 w-4" /> Start Recording
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
