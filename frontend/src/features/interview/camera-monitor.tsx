"use client";

import {
  Camera,
  CameraOff,
  Eye,
  EyeOff,
  Users,
  Move,
  AlertTriangle,
  Loader2,
  Video,
  VideoOff,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/utils/cn";
import type { CameraMetrics } from "@/types/camera";

interface CameraMonitorProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  metrics: CameraMetrics;
  isActive: boolean;
  isLoading: boolean;
  error: string | null;
  permissionDenied: boolean;
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
  recordVideo: boolean;
  onRecordVideoChange: (record: boolean) => void;
  onRetry: () => void;
}

function MetricIndicator({
  label,
  value,
  status,
  icon: Icon,
}: {
  label: string;
  value: string;
  status: "good" | "warning" | "bad" | "neutral";
  icon: React.ComponentType<{ className?: string }>;
}) {
  const colors = {
    good: "text-emerald-600 bg-emerald-500/10 border-emerald-500/30",
    warning: "text-amber-600 bg-amber-500/10 border-amber-500/30",
    bad: "text-red-600 bg-red-500/10 border-red-500/30",
    neutral: "text-muted-foreground bg-secondary/50 border-border",
  };

  return (
    <div className={cn("rounded-lg border p-2.5 flex items-center gap-2", colors[status])}>
      <Icon className="h-4 w-4 shrink-0" />
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-wide opacity-70">{label}</p>
        <p className="text-xs font-semibold truncate">{value}</p>
      </div>
    </div>
  );
}

function ScoreBar({ label, score }: { label: string; score: number }) {
  const color =
    score >= 70 ? "bg-emerald-500" : score >= 40 ? "bg-amber-500" : "bg-red-500";

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{score}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
        <div className={cn("h-full rounded-full transition-all duration-300", color)} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}

export function CameraMonitor({
  videoRef,
  metrics,
  isActive,
  isLoading,
  error,
  permissionDenied,
  enabled,
  onEnabledChange,
  recordVideo,
  onRecordVideoChange,
  onRetry,
}: CameraMonitorProps) {
  const faceStatus = !metrics.faceDetected
    ? "bad"
    : metrics.faceVisibility >= 60
      ? "good"
      : "warning";

  const eyeStatus = metrics.eyeContactScore >= 70
    ? "good"
    : metrics.eyeContactScore >= 40
      ? "warning"
      : "bad";

  const movementStatus =
    metrics.headMovementLevel === "stable"
      ? "good"
      : metrics.headMovementLevel === "moderate"
        ? "warning"
        : "bad";

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle className="text-base flex items-center gap-2">
          <Camera className="h-4 w-4 text-primary" />
          Camera Monitor
        </CardTitle>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onEnabledChange(!enabled)}
          className="text-xs gap-1"
        >
          {enabled ? <CameraOff className="h-3.5 w-3.5" /> : <Camera className="h-3.5 w-3.5" />}
          {enabled ? "Disable" : "Enable"}
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {enabled ? (
          <>
            <div className="relative rounded-xl overflow-hidden bg-black aspect-video">
              <video
                ref={videoRef}
                className={cn(
                  "w-full h-full object-cover mirror",
                  !isActive && "opacity-0"
                )}
                style={{ transform: "scaleX(-1)" }}
                playsInline
                muted
              />
              {!recordVideo && isActive && (
                <div className="absolute top-2 left-2">
                  <Badge variant="secondary" className="text-[10px] bg-black/50 text-white border-0">
                    Not recording
                  </Badge>
                </div>
              )}
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                  <Loader2 className="h-8 w-8 animate-spin text-white" />
                </div>
              )}
              {!isActive && !isLoading && error && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 p-4 text-center">
                  <AlertTriangle className="h-8 w-8 text-amber-500 mb-2" />
                  <p className="text-xs text-white/80">{error}</p>
                  {permissionDenied && (
                    <Button size="sm" variant="outline" className="mt-3" onClick={onRetry}>
                      Retry
                    </Button>
                  )}
                </div>
              )}
              {metrics.multipleFaces && isActive && (
                <div className="absolute top-2 right-2">
                  <Badge variant="destructive" className="text-[10px] gap-1">
                    <Users className="h-3 w-3" /> Multiple faces
                  </Badge>
                </div>
              )}
              {metrics.lookingAway && metrics.faceDetected && isActive && (
                <div className="absolute bottom-2 left-2 right-2">
                  <Badge variant="warning" className="text-[10px] w-full justify-center gap-1">
                    <EyeOff className="h-3 w-3" /> Looking away — face the camera
                  </Badge>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <MetricIndicator
                label="Face"
                value={metrics.faceDetected ? "Detected" : "Not found"}
                status={faceStatus}
                icon={metrics.faceDetected ? Camera : CameraOff}
              />
              <MetricIndicator
                label="Eye Contact"
                value={metrics.faceDetected ? `${metrics.eyeContactScore}%` : "—"}
                status={metrics.faceDetected ? eyeStatus : "neutral"}
                icon={metrics.lookingAway ? EyeOff : Eye}
              />
              <MetricIndicator
                label="Head Movement"
                value={metrics.headMovementLevel}
                status={metrics.faceDetected ? movementStatus : "neutral"}
                icon={Move}
              />
              <MetricIndicator
                label="Multi-Face"
                value={metrics.multipleFaces ? "Detected" : "None"}
                status={metrics.multipleFaces ? "bad" : "good"}
                icon={Users}
              />
            </div>

            {metrics.faceDetected && (
              <div className="space-y-2">
                <ScoreBar label="Eye Contact Score" score={metrics.eyeContactScore} />
                <ScoreBar label="Face Visibility" score={metrics.faceVisibility} />
                <ScoreBar label="Head Stability" score={metrics.headStability} />
              </div>
            )}

            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <div className="flex items-center gap-2 text-xs">
                {recordVideo ? (
                  <Video className="h-4 w-4 text-red-500" />
                ) : (
                  <VideoOff className="h-4 w-4 text-muted-foreground" />
                )}
                <span>Store video recording</span>
              </div>
              <Button
                type="button"
                variant={recordVideo ? "destructive" : "outline"}
                size="sm"
                className="text-xs h-7"
                onClick={() => onRecordVideoChange(!recordVideo)}
              >
                {recordVideo ? "On" : "Off"}
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground">
              Video is processed locally in your browser. Recording is off by default — only metrics are sent with your answers.
            </p>
          </>
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            <CameraOff className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Camera monitoring disabled</p>
            <Button variant="outline" size="sm" className="mt-3" onClick={() => onEnabledChange(true)}>
              Enable Camera
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
