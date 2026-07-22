"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Play, FileText, Briefcase, Mic, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/utils/cn";
import {
  DOMAIN_OPTIONS,
  DIFFICULTY_OPTIONS,
  DURATION_OPTIONS,
  QUESTION_COUNT_OPTIONS,
  InterviewDomain,
  DifficultyLevel,
} from "@/types/interview";
import { interviewService } from "@/services/interview.service";
import { useToast } from "@/hooks/use-toast";
import { getErrorMessage } from "@/lib/axios";
import type { Resume } from "@/types/resume";

const setupSchema = z.object({
  domain: z.string(),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]),
  durationMinutes: z.number(),
  questionCount: z.number(),
  resumeId: z.string().optional(),
  useResume: z.boolean(),
});

type SetupForm = z.infer<typeof setupSchema>;

interface InterviewSetupProps {
  resumes: Resume[];
}

export function InterviewSetup({ resumes }: InterviewSetupProps) {
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const { register, handleSubmit, watch, setValue } = useForm<SetupForm>({
    resolver: zodResolver(setupSchema),
    defaultValues: {
      domain: "FRONTEND_DEVELOPER",
      difficulty: "MEDIUM",
      durationMinutes: 20,
      questionCount: 10,
      useResume: false,
      resumeId: resumes[0]?.id,
    },
  });

  const useResume = watch("useResume");
  const domain = watch("domain");
  const difficulty = watch("difficulty");

  const onSubmit = async (data: SetupForm) => {
    setIsCreating(true);
    try {
      const interview = await interviewService.create({
        domain: data.domain as InterviewDomain,
        difficulty: data.difficulty as DifficultyLevel,
        durationMinutes: data.durationMinutes,
        questionCount: data.questionCount,
        resumeId: data.useResume && data.resumeId ? data.resumeId : undefined,
      });
      toast({ title: "Interview created", description: "Starting your session...", variant: "success" });
      router.push(`/interview/${interview.id}`);
    } catch (error) {
      toast({ title: "Failed to create interview", description: getErrorMessage(error), variant: "destructive" });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-primary" />
            Interview Source
          </CardTitle>
          <CardDescription>Choose how to personalize your interview questions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setValue("useResume", false)}
              className={cn(
                "rounded-xl border-2 p-4 text-left transition-all",
                !useResume ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
              )}
            >
              <Briefcase className="h-6 w-6 text-primary mb-2" />
              <p className="font-semibold text-sm">Domain Only</p>
              <p className="text-xs text-muted-foreground mt-1">Questions based on selected domain</p>
            </button>
            <button
              type="button"
              onClick={() => setValue("useResume", true)}
              disabled={resumes.length === 0}
              className={cn(
                "rounded-xl border-2 p-4 text-left transition-all",
                useResume ? "border-primary bg-primary/5" : "border-border hover:border-primary/30",
                resumes.length === 0 && "opacity-50 cursor-not-allowed"
              )}
            >
              <FileText className="h-6 w-6 text-primary mb-2" />
              <p className="font-semibold text-sm">Use Resume</p>
              <p className="text-xs text-muted-foreground mt-1">
                {resumes.length ? "Tailor questions to your resume" : "Upload a resume first"}
              </p>
            </button>
          </div>

          {useResume && resumes.length > 0 && (
            <div className="space-y-2">
              <Label>Select Resume</Label>
              <select
                {...register("resumeId")}
                className="flex h-10 w-full rounded-lg border border-input bg-background/50 px-3 py-2 text-sm"
              >
                {resumes.map((r) => (
                  <option key={r.id} value={r.id}>{r.title}</option>
                ))}
              </select>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Select Domain</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {DOMAIN_OPTIONS.map((d) => (
              <button
                key={d.value}
                type="button"
                onClick={() => setValue("domain", d.value)}
                className={cn(
                  "rounded-lg border px-3 py-2.5 text-sm text-left transition-all",
                  domain === d.value ? "border-primary bg-primary/10 font-medium" : "border-border hover:bg-secondary/50"
                )}
              >
                {d.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Difficulty Level</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-3">
            {DIFFICULTY_OPTIONS.map((d) => (
              <button
                key={d.value}
                type="button"
                onClick={() => setValue("difficulty", d.value)}
                className={cn(
                  "rounded-xl border-2 p-4 text-left transition-all",
                  difficulty === d.value ? "border-primary bg-primary/5" : "border-border"
                )}
              >
                <p className="font-semibold">{d.label}</p>
                <p className="text-xs text-muted-foreground mt-1">{d.description}</p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 sm:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Duration</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {DURATION_OPTIONS.map((d) => (
                <button
                  key={d.value}
                  type="button"
                  onClick={() => setValue("durationMinutes", d.value)}
                  className={cn(
                    "rounded-lg border px-3 py-2 text-sm transition-all",
                    watch("durationMinutes") === d.value ? "border-primary bg-primary/10" : "border-border"
                  )}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Number of Questions</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {QUESTION_COUNT_OPTIONS.map((q) => (
                <button
                  key={q.value}
                  type="button"
                  onClick={() => setValue("questionCount", q.value)}
                  className={cn(
                    "rounded-lg border px-3 py-2 text-sm transition-all",
                    watch("questionCount") === q.value ? "border-primary bg-primary/10" : "border-border"
                  )}
                >
                  {q.label}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-violet-500/20 bg-violet-500/5">
        <CardContent className="pt-6 flex items-start gap-3">
          <Camera className="h-5 w-5 text-violet-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-sm">Camera Monitoring</p>
            <p className="text-xs text-muted-foreground mt-1">
              During the interview, your webcam tracks face visibility, eye contact, head movement, and multiple-face detection using MediaPipe.
              Video is not stored unless you explicitly enable recording.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6 flex items-start gap-3">
          <Mic className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-sm">Voice Interview Enabled</p>
            <p className="text-xs text-muted-foreground mt-1">
              Questions are read aloud via text-to-speech. Answer using your microphone with live transcription.
              You can edit the transcription before submitting. Use Chrome or Edge for best speech recognition support.
            </p>
          </div>
        </CardContent>
      </Card>

      <Button type="submit" variant="gradient" size="lg" className="w-full gap-2" isLoading={isCreating}>
        <Play className="h-5 w-5" />
        Start Interview
      </Button>
    </form>
  );
}
