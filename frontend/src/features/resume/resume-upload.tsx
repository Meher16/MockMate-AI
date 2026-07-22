"use client";

import { useCallback, useState } from "react";
import { Upload, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { resumeService } from "@/services/resume.service";
import { useToast } from "@/hooks/use-toast";
import { getErrorMessage } from "@/lib/axios";
import { cn } from "@/utils/cn";

interface ResumeUploadProps {
  onSuccess: () => void;
}

export function ResumeUpload({ onSuccess }: ResumeUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFile = (selected: File | null) => {
    if (!selected) return;
    if (selected.type !== "application/pdf") {
      toast({ title: "Invalid file", description: "Only PDF files are allowed", variant: "destructive" });
      return;
    }
    if (selected.size > 5 * 1024 * 1024) {
      toast({ title: "File too large", description: "Maximum size is 5MB", variant: "destructive" });
      return;
    }
    setFile(selected);
    if (!title) {
      setTitle(selected.name.replace(/\.pdf$/i, ""));
    }
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleFile(e.dataTransfer.files[0] ?? null);
    },
    [title]
  );

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    try {
      await resumeService.upload(file, title || undefined);
      toast({ title: "Resume uploaded", description: "PDF parsed successfully", variant: "success" });
      setFile(null);
      setTitle("");
      onSuccess();
    } catch (error) {
      toast({ title: "Upload failed", description: getErrorMessage(error), variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={cn(
            "border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer",
            isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50",
            file && "border-emerald-500/50 bg-emerald-500/5"
          )}
          onClick={() => document.getElementById("resume-file")?.click()}
        >
          <input
            id="resume-file"
            type="file"
            accept=".pdf,application/pdf"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
          />
          {file ? (
            <div className="flex flex-col items-center gap-2">
              <FileText className="h-10 w-10 text-emerald-500" />
              <p className="font-medium">{file.name}</p>
              <p className="text-sm text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Upload className="h-10 w-10 text-muted-foreground" />
              <p className="font-medium">Drop your PDF resume here</p>
              <p className="text-sm text-muted-foreground">or click to browse (max 5MB)</p>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="resume-title">Resume Title</Label>
          <Input
            id="resume-title"
            placeholder="e.g. Software Engineer Resume"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <Button
          variant="gradient"
          className="w-full"
          disabled={!file || isUploading}
          onClick={handleUpload}
        >
          {isUploading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Uploading & Parsing...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4" />
              Upload Resume
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
