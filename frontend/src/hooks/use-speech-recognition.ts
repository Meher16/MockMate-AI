"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface UseSpeechRecognitionOptions {
  lang?: string;
  continuous?: boolean;
  onFinalTranscript?: (transcript: string) => void;
}

export function useSpeechRecognition(options: UseSpeechRecognitionOptions = {}) {
  const { lang = "en-US", continuous = true, onFinalTranscript } = options;

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const finalBufferRef = useRef("");
  const onFinalRef = useRef(onFinalTranscript);

  useEffect(() => {
    onFinalRef.current = onFinalTranscript;
  }, [onFinalTranscript]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const SpeechRecognitionCtor = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    setIsSupported(!!SpeechRecognitionCtor);

    if (!SpeechRecognitionCtor) return;

    const recognition = new SpeechRecognitionCtor();
    recognition.continuous = continuous;
    recognition.interimResults = true;
    recognition.lang = lang;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = "";
      let finalText = finalBufferRef.current;

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const text = result[0]?.transcript ?? "";
        if (result.isFinal) {
          finalText += (finalText ? " " : "") + text.trim();
        } else {
          interim += text;
        }
      }

      finalBufferRef.current = finalText;
      setTranscript(finalText);
      setInterimTranscript(interim);
      onFinalRef.current?.(finalText);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error === "no-speech" || event.error === "aborted") return;
      setError(event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      setInterimTranscript("");
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.abort();
    };
  }, [lang, continuous]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) return;
    setError(null);
    try {
      recognitionRef.current.start();
      setIsListening(true);
    } catch {
      // Already started — restart
      recognitionRef.current.stop();
      setTimeout(() => {
        recognitionRef.current?.start();
        setIsListening(true);
      }, 100);
    }
  }, []);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
    setInterimTranscript("");
  }, []);

  const resetTranscript = useCallback(() => {
    finalBufferRef.current = "";
    setTranscript("");
    setInterimTranscript("");
    setError(null);
  }, []);

  const appendTranscript = useCallback((text: string) => {
    finalBufferRef.current = text;
    setTranscript(text);
  }, []);

  const displayTranscript = interimTranscript
    ? `${transcript}${transcript ? " " : ""}${interimTranscript}`
    : transcript;

  return {
    isListening,
    isSupported,
    transcript,
    interimTranscript,
    displayTranscript,
    error,
    startListening,
    stopListening,
    resetTranscript,
    appendTranscript,
  };
}
