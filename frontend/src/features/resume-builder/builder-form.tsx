"use client";

import React, { useState } from "react";
import { useForm, useFieldArray, UseFormReturn } from "react-hook-form";
import { Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/utils/cn";
import {
  ResumeBuilderData,
  TEMPLATE_OPTIONS,
  createId,
  createEmptyBuilderData,
} from "@/types/resume-builder";

export interface BuilderFormValues {
  title: string;
  builderData: ResumeBuilderData;
}

interface BuilderFormProps {
  form: UseFormReturn<BuilderFormValues>;
}

function SectionCard({
  title,
  children,
  onAdd,
  addLabel,
}: {
  title: string;
  children: React.ReactNode;
  onAdd?: () => void;
  addLabel?: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-base">{title}</CardTitle>
        {onAdd && (
          <Button type="button" variant="outline" size="sm" onClick={onAdd} className="gap-1">
            <Plus className="h-3.5 w-3.5" /> {addLabel ?? "Add"}
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
    </Card>
  );
}

export function BuilderForm({ form }: BuilderFormProps) {
  const { register, control, watch, setValue } = form;
  const template = watch("builderData.template");
  const skills = watch("builderData.skills") ?? [];

  const experience = useFieldArray({ control, name: "builderData.experience" });
  const education = useFieldArray({ control, name: "builderData.education" });
  const projects = useFieldArray({ control, name: "builderData.projects" });
  const certifications = useFieldArray({ control, name: "builderData.certifications" });
  const languages = useFieldArray({ control, name: "builderData.languages" });

  const [skillInput, setSkillInput] = useState("");

  const addSkill = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setValue("builderData.skills", [...skills, trimmed]);
      setSkillInput("");
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader><CardTitle className="text-base">Resume Title</CardTitle></CardHeader>
        <CardContent>
          <Input {...register("title", { required: true })} placeholder="e.g. Software Engineer Resume" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Template</CardTitle></CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-3">
            {TEMPLATE_OPTIONS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setValue("builderData.template", t.id)}
                className={cn(
                  "rounded-xl border-2 p-4 text-left transition-all hover:border-primary/50",
                  template === t.id ? "border-primary bg-primary/5" : "border-border"
                )}
              >
                <p className="font-semibold text-sm">{t.label}</p>
                <p className="text-xs text-muted-foreground mt-1">{t.description}</p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <SectionCard title="Personal Information">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label>Full Name *</Label>
            <Input {...register("builderData.personalInfo.fullName", { required: true })} placeholder="John Doe" />
          </div>
          <div className="space-y-2">
            <Label>Job Title</Label>
            <Input {...register("builderData.personalInfo.jobTitle")} placeholder="Software Engineer" />
          </div>
          <div className="space-y-2">
            <Label>Email *</Label>
            <Input type="email" {...register("builderData.personalInfo.email")} placeholder="john@email.com" />
          </div>
          <div className="space-y-2">
            <Label>Phone</Label>
            <Input {...register("builderData.personalInfo.phone")} placeholder="+1 234 567 8900" />
          </div>
          <div className="space-y-2">
            <Label>Location</Label>
            <Input {...register("builderData.personalInfo.location")} placeholder="San Francisco, CA" />
          </div>
          <div className="space-y-2">
            <Label>LinkedIn</Label>
            <Input {...register("builderData.personalInfo.linkedIn")} placeholder="linkedin.com/in/johndoe" />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Website</Label>
            <Input {...register("builderData.personalInfo.website")} placeholder="johndoe.dev" />
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Summary">
        <Textarea
          {...register("builderData.summary")}
          rows={4}
          placeholder="Brief professional summary highlighting your experience and goals..."
        />
      </SectionCard>

      <SectionCard title="Skills">
        <div className="flex gap-2">
          <Input
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
            placeholder="Add a skill and press Enter"
          />
          <Button type="button" variant="outline" onClick={addSkill}>Add</Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {skills.map((skill) => (
            <span key={skill} className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary px-3 py-1 text-xs">
              {skill}
              <button type="button" onClick={() => setValue("builderData.skills", skills.filter((s) => s !== skill))}>
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      </SectionCard>

      <SectionCard
        title="Experience"
        onAdd={() => experience.append({
          id: createId(), company: "", role: "", location: "", startDate: "", endDate: "", current: false, description: "",
        })}
        addLabel="Add Job"
      >
        {experience.fields.length === 0 && (
          <p className="text-sm text-muted-foreground">No experience added yet.</p>
        )}
        {experience.fields.map((field, index) => (
          <div key={field.id} className="rounded-lg border border-border p-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-sm font-medium">Position {index + 1}</span>
              <Button type="button" variant="ghost" size="icon" onClick={() => experience.remove(index)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Input {...register(`builderData.experience.${index}.role`)} placeholder="Job Title" />
              <Input {...register(`builderData.experience.${index}.company`)} placeholder="Company" />
              <Input {...register(`builderData.experience.${index}.location`)} placeholder="Location" />
              <Input {...register(`builderData.experience.${index}.startDate`)} placeholder="Start (e.g. Jan 2022)" />
              <Input {...register(`builderData.experience.${index}.endDate`)} placeholder="End Date" />
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" {...register(`builderData.experience.${index}.current`)} />
                Currently working here
              </label>
            </div>
            <Textarea {...register(`builderData.experience.${index}.description`)} rows={3} placeholder="Describe responsibilities and achievements..." />
          </div>
        ))}
      </SectionCard>

      <SectionCard
        title="Education"
        onAdd={() => education.append({
          id: createId(), institution: "", degree: "", field: "", startDate: "", endDate: "", gpa: "",
        })}
        addLabel="Add Education"
      >
        {education.fields.map((field, index) => (
          <div key={field.id} className="rounded-lg border border-border p-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-sm font-medium">Education {index + 1}</span>
              <Button type="button" variant="ghost" size="icon" onClick={() => education.remove(index)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Input {...register(`builderData.education.${index}.degree`)} placeholder="Degree" />
              <Input {...register(`builderData.education.${index}.field`)} placeholder="Field of Study" />
              <Input {...register(`builderData.education.${index}.institution`)} placeholder="Institution" className="sm:col-span-2" />
              <Input {...register(`builderData.education.${index}.startDate`)} placeholder="Start Date" />
              <Input {...register(`builderData.education.${index}.endDate`)} placeholder="End Date" />
              <Input {...register(`builderData.education.${index}.gpa`)} placeholder="GPA (optional)" />
            </div>
          </div>
        ))}
      </SectionCard>

      <SectionCard
        title="Projects"
        onAdd={() => projects.append({ id: createId(), name: "", url: "", technologies: "", description: "" })}
        addLabel="Add Project"
      >
        {projects.fields.map((field, index) => (
          <div key={field.id} className="rounded-lg border border-border p-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-sm font-medium">Project {index + 1}</span>
              <Button type="button" variant="ghost" size="icon" onClick={() => projects.remove(index)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
            <Input {...register(`builderData.projects.${index}.name`)} placeholder="Project Name" />
            <Input {...register(`builderData.projects.${index}.technologies`)} placeholder="Technologies used" />
            <Textarea {...register(`builderData.projects.${index}.description`)} rows={2} placeholder="Description" />
            <Input {...register(`builderData.projects.${index}.url`)} placeholder="Project URL (optional)" />
          </div>
        ))}
      </SectionCard>

      <SectionCard
        title="Certifications"
        onAdd={() => certifications.append({ id: createId(), name: "", issuer: "", date: "" })}
        addLabel="Add Certification"
      >
        {certifications.fields.map((field, index) => (
          <div key={field.id} className="grid gap-3 sm:grid-cols-3 items-end">
            <Input {...register(`builderData.certifications.${index}.name`)} placeholder="Certification Name" />
            <Input {...register(`builderData.certifications.${index}.issuer`)} placeholder="Issuer" />
            <div className="flex gap-2">
              <Input {...register(`builderData.certifications.${index}.date`)} placeholder="Date" />
              <Button type="button" variant="ghost" size="icon" onClick={() => certifications.remove(index)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>
        ))}
      </SectionCard>

      <SectionCard
        title="Languages"
        onAdd={() => languages.append({ id: createId(), language: "", proficiency: "" })}
        addLabel="Add Language"
      >
        {languages.fields.map((field, index) => (
          <div key={field.id} className="flex gap-2">
            <Input {...register(`builderData.languages.${index}.language`)} placeholder="Language" />
            <Input {...register(`builderData.languages.${index}.proficiency`)} placeholder="Proficiency" />
            <Button type="button" variant="ghost" size="icon" onClick={() => languages.remove(index)}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        ))}
      </SectionCard>

      <SectionCard
        title="Achievements"
        onAdd={() => {
          const current = form.getValues("builderData.achievements") ?? [];
          setValue("builderData.achievements", [...current, ""]);
        }}
        addLabel="Add Achievement"
      >
        {(watch("builderData.achievements") ?? []).map((_, index) => (
          <div key={index} className="flex gap-2">
            <Input {...register(`builderData.achievements.${index}`)} placeholder="Achievement or award" />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => {
                const current = form.getValues("builderData.achievements") ?? [];
                setValue("builderData.achievements", current.filter((_, i) => i !== index));
              }}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        ))}
      </SectionCard>
    </div>
  );
}

export function useBuilderForm(defaultValues?: Partial<BuilderFormValues>) {
  return useForm<BuilderFormValues>({
    defaultValues: {
      title: defaultValues?.title ?? "My Resume",
      builderData: defaultValues?.builderData ?? createEmptyBuilderData(),
    },
  });
}
