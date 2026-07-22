"use client";

import type { ResumeBuilderData, ResumeTemplate } from "@/types/resume-builder";
import { cn } from "@/utils/cn";

interface ResumePreviewProps {
  data: ResumeBuilderData;
  className?: string;
  scale?: number;
}

function ContactLine({ items }: { items: (string | undefined)[] }) {
  const filtered = items.filter(Boolean);
  if (!filtered.length) return null;
  return (
    <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs opacity-80">
      {filtered.map((item, i) => (
        <span key={i}>{item}</span>
      ))}
    </div>
  );
}

function ClassicPreview({ data }: { data: ResumeBuilderData }) {
  const p = data.personalInfo;
  return (
    <div className="font-serif text-[#1a1a1a] p-8 text-sm leading-relaxed">
      <h1 className="text-2xl font-bold uppercase tracking-wide mb-1">{p.fullName || "Your Name"}</h1>
      {p.jobTitle && <p className="text-gray-600 mb-2">{p.jobTitle}</p>}
      <ContactLine items={[p.email, p.phone, p.location, p.linkedIn, p.website]} />
      <hr className="border-black my-4" />

      {data.summary && (
        <section className="mb-4">
          <h2 className="text-xs uppercase tracking-widest border-b border-gray-300 pb-1 mb-2">Summary</h2>
          <p className="text-xs">{data.summary}</p>
        </section>
      )}

      {data.skills.length > 0 && (
        <section className="mb-4">
          <h2 className="text-xs uppercase tracking-widest border-b border-gray-300 pb-1 mb-2">Skills</h2>
          <p className="text-xs">{data.skills.join(" · ")}</p>
        </section>
      )}

      {data.experience.map((exp) => (
        <section key={exp.id} className="mb-3">
          <h2 className="text-xs uppercase tracking-widest border-b border-gray-300 pb-1 mb-2">Experience</h2>
          <div className="flex justify-between font-bold text-xs">
            <span>{exp.role}</span>
            <span>{exp.current ? `${exp.startDate} - Present` : `${exp.startDate} - ${exp.endDate}`}</span>
          </div>
          <p className="text-xs italic text-gray-600">{exp.company}{exp.location ? ` · ${exp.location}` : ""}</p>
          {exp.description && <p className="text-xs mt-1 whitespace-pre-wrap">{exp.description}</p>}
        </section>
      ))}

      {data.education.map((edu) => (
        <section key={edu.id} className="mb-3">
          <h2 className="text-xs uppercase tracking-widest border-b border-gray-300 pb-1 mb-2">Education</h2>
          <div className="flex justify-between font-bold text-xs">
            <span>{edu.degree}{edu.field ? ` in ${edu.field}` : ""}</span>
            <span>{edu.startDate} - {edu.endDate}</span>
          </div>
          <p className="text-xs italic text-gray-600">{edu.institution}{edu.gpa ? ` · GPA: ${edu.gpa}` : ""}</p>
        </section>
      ))}

      {data.projects.length > 0 && (
        <section className="mb-4">
          <h2 className="text-xs uppercase tracking-widest border-b border-gray-300 pb-1 mb-2">Projects</h2>
          {data.projects.map((proj) => (
            <div key={proj.id} className="mb-2">
              <p className="font-bold text-xs">{proj.name}</p>
              {proj.technologies && <p className="text-xs text-gray-600">{proj.technologies}</p>}
              {proj.description && <p className="text-xs">{proj.description}</p>}
            </div>
          ))}
        </section>
      )}

      {data.certifications.length > 0 && (
        <section className="mb-4">
          <h2 className="text-xs uppercase tracking-widest border-b border-gray-300 pb-1 mb-2">Certifications</h2>
          {data.certifications.map((c) => (
            <p key={c.id} className="text-xs">{c.name} — {c.issuer} ({c.date})</p>
          ))}
        </section>
      )}

      {data.languages.length > 0 && (
        <section className="mb-4">
          <h2 className="text-xs uppercase tracking-widest border-b border-gray-300 pb-1 mb-2">Languages</h2>
          <p className="text-xs">{data.languages.map((l) => `${l.language} (${l.proficiency})`).join(" · ")}</p>
        </section>
      )}

      {data.achievements.length > 0 && (
        <section>
          <h2 className="text-xs uppercase tracking-widest border-b border-gray-300 pb-1 mb-2">Achievements</h2>
          <ul className="text-xs list-disc pl-4">
            {data.achievements.map((a, i) => <li key={i}>{a}</li>)}
          </ul>
        </section>
      )}
    </div>
  );
}

function ModernPreview({ data }: { data: ResumeBuilderData }) {
  const p = data.personalInfo;
  return (
    <div className="text-sm leading-relaxed overflow-hidden">
      <div className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white p-6">
        <h1 className="text-2xl font-bold">{p.fullName || "Your Name"}</h1>
        {p.jobTitle && <p className="text-white/90 mt-1">{p.jobTitle}</p>}
        <div className="mt-3">
          <ContactLine items={[p.email, p.phone, p.location, p.linkedIn, p.website]} />
        </div>
      </div>
      <div className="p-6 space-y-4 text-slate-700">
        {data.summary && (
          <section>
            <h2 className="text-xs uppercase tracking-wider text-indigo-600 font-semibold mb-2">Summary</h2>
            <p className="text-xs">{data.summary}</p>
          </section>
        )}
        {data.skills.length > 0 && (
          <section>
            <h2 className="text-xs uppercase tracking-wider text-indigo-600 font-semibold mb-2">Skills</h2>
            <div className="flex flex-wrap gap-1.5">
              {data.skills.map((s) => (
                <span key={s} className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full">{s}</span>
              ))}
            </div>
          </section>
        )}
        {data.experience.map((exp) => (
          <section key={exp.id}>
            <h2 className="text-xs uppercase tracking-wider text-indigo-600 font-semibold mb-2">Experience</h2>
            <div className="flex justify-between font-semibold text-xs">
              <span>{exp.role}</span>
              <span className="text-slate-500">{exp.current ? `${exp.startDate} - Present` : `${exp.startDate} - ${exp.endDate}`}</span>
            </div>
            <p className="text-xs text-slate-500">{exp.company}{exp.location ? ` · ${exp.location}` : ""}</p>
            {exp.description && <p className="text-xs mt-1 whitespace-pre-wrap">{exp.description}</p>}
          </section>
        ))}
        {data.education.map((edu) => (
          <section key={edu.id}>
            <h2 className="text-xs uppercase tracking-wider text-indigo-600 font-semibold mb-2">Education</h2>
            <div className="flex justify-between font-semibold text-xs">
              <span>{edu.degree}{edu.field ? ` in ${edu.field}` : ""}</span>
              <span className="text-slate-500">{edu.startDate} - {edu.endDate}</span>
            </div>
            <p className="text-xs text-slate-500">{edu.institution}</p>
          </section>
        ))}
        {data.projects.length > 0 && (
          <section>
            <h2 className="text-xs uppercase tracking-wider text-indigo-600 font-semibold mb-2">Projects</h2>
            {data.projects.map((proj) => (
              <div key={proj.id} className="mb-2">
                <p className="font-semibold text-xs">{proj.name}</p>
                <p className="text-xs text-slate-500">{proj.technologies}</p>
                <p className="text-xs">{proj.description}</p>
              </div>
            ))}
          </section>
        )}
        {data.certifications.length > 0 && (
          <section>
            <h2 className="text-xs uppercase tracking-wider text-indigo-600 font-semibold mb-2">Certifications</h2>
            {data.certifications.map((c) => (
              <p key={c.id} className="text-xs">{c.name} — {c.issuer}</p>
            ))}
          </section>
        )}
        {data.languages.length > 0 && (
          <section>
            <h2 className="text-xs uppercase tracking-wider text-indigo-600 font-semibold mb-2">Languages</h2>
            <div className="flex flex-wrap gap-1.5">
              {data.languages.map((l) => (
                <span key={l.id} className="text-xs bg-slate-100 px-2 py-0.5 rounded">{l.language} ({l.proficiency})</span>
              ))}
            </div>
          </section>
        )}
        {data.achievements.length > 0 && (
          <section>
            <h2 className="text-xs uppercase tracking-wider text-indigo-600 font-semibold mb-2">Achievements</h2>
            <ul className="text-xs list-disc pl-4">
              {data.achievements.map((a, i) => <li key={i}>{a}</li>)}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}

function MinimalPreview({ data }: { data: ResumeBuilderData }) {
  const p = data.personalInfo;
  return (
    <div className="p-10 text-sm leading-loose text-gray-700">
      <h1 className="text-xl font-light uppercase tracking-[0.2em] text-gray-800">{p.fullName || "Your Name"}</h1>
      {p.jobTitle && <p className="text-xs text-gray-400 tracking-wide mt-1">{p.jobTitle}</p>}
      <p className="text-[10px] text-gray-400 mt-3">
        {[p.email, p.phone, p.location].filter(Boolean).join(" · ")}
      </p>

      {data.summary && (
        <section className="mt-8">
          <h2 className="text-[10px] uppercase tracking-[0.25em] text-gray-400 mb-3">Summary</h2>
          <p className="text-xs text-gray-600">{data.summary}</p>
        </section>
      )}
      {data.skills.length > 0 && (
        <section className="mt-8">
          <h2 className="text-[10px] uppercase tracking-[0.25em] text-gray-400 mb-3">Skills</h2>
          <p className="text-xs">{data.skills.join(" · ")}</p>
        </section>
      )}
      {data.experience.map((exp) => (
        <section key={exp.id} className="mt-8">
          <h2 className="text-[10px] uppercase tracking-[0.25em] text-gray-400 mb-3">Experience</h2>
          <p className="text-xs font-medium">{exp.role} — {exp.company}</p>
          <p className="text-[10px] text-gray-400">{exp.startDate} - {exp.current ? "Present" : exp.endDate}</p>
          {exp.description && <p className="text-xs mt-2 whitespace-pre-wrap text-gray-600">{exp.description}</p>}
        </section>
      ))}
      {data.education.map((edu) => (
        <section key={edu.id} className="mt-8">
          <h2 className="text-[10px] uppercase tracking-[0.25em] text-gray-400 mb-3">Education</h2>
          <p className="text-xs font-medium">{edu.degree}{edu.field ? `, ${edu.field}` : ""}</p>
          <p className="text-[10px] text-gray-400">{edu.institution}</p>
        </section>
      ))}
    </div>
  );
}

const PREVIEW_MAP: Record<ResumeTemplate, React.ComponentType<{ data: ResumeBuilderData }>> = {
  classic: ClassicPreview,
  modern: ModernPreview,
  minimal: MinimalPreview,
};

export function ResumePreview({ data, className, scale = 1 }: ResumePreviewProps) {
  const Preview = PREVIEW_MAP[data.template] ?? ModernPreview;

  return (
    <div
      id="resume-preview"
      className={cn(
        "bg-white rounded-lg shadow-2xl overflow-hidden origin-top",
        className
      )}
      style={{ transform: scale !== 1 ? `scale(${scale})` : undefined }}
    >
      <Preview data={data} />
    </div>
  );
}
