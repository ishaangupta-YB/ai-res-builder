"use client";

import type { ResumeValues } from "@/lib/validation";
import {
    Mail,
    Phone,
    MapPin,
    Linkedin,
    Globe,
    ExternalLink,
} from "lucide-react";
import { DEFAULT_SECTION_ORDER } from "./sectionConfig";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isFieldVisible(
    fv: Record<string, boolean> | undefined,
    field: string,
): boolean {
    return fv?.[field] !== false;
}

const LINK_LABEL_MODE_KEYS = {
    linkedin: "linkLabelMode.linkedin",
    website: "linkLabelMode.website",
} as const;

function shouldUseLinkLabel(
    fv: Record<string, boolean> | undefined,
    field: keyof typeof LINK_LABEL_MODE_KEYS,
): boolean {
    return fv?.[LINK_LABEL_MODE_KEYS[field]] === true;
}

function isSectionVisible(
    sv: Record<string, boolean> | undefined,
    key: string,
): boolean {
    return sv?.[key] !== false;
}

function fmtDate(d?: string): string {
    if (!d) return "";
    const date = new Date(d);
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    return `${y}/${m}`;
}

function dateRange(start?: string, end?: string): string {
    const s = fmtDate(start);
    const e = end ? fmtDate(end) : "present";
    if (!s && e === "present") return "";
    return `${s || "?"} – ${e}`;
}

// ---------------------------------------------------------------------------
// Section heading with extending horizontal rule
// ---------------------------------------------------------------------------

function SectionHeading({ children }: { children: React.ReactNode }) {
    return (
        <div className="mb-[6px] mt-[14px] flex items-baseline gap-2">
            <h3 className="whitespace-nowrap text-[11.5px] font-bold uppercase tracking-[0.08em]">
                {children}
            </h3>
            <div className="h-px flex-1 bg-current opacity-80" />
        </div>
    );
}

// ---------------------------------------------------------------------------
// Inline contact item
// ---------------------------------------------------------------------------

function ContactItem({
    icon: Icon,
    children,
}: {
    icon: React.ComponentType<{ className?: string }>;
    children: React.ReactNode;
}) {
    return (
        <span className="inline-flex items-center gap-[3px]">
            <Icon className="h-[10px] w-[10px] shrink-0 opacity-70" />
            <span>{children}</span>
        </span>
    );
}

// ---------------------------------------------------------------------------
// Template sections
// ---------------------------------------------------------------------------

function HeaderBlock({ data }: { data: ResumeValues }) {
    const fv = data.fieldVisibility;
    const firstName = isFieldVisible(fv, "firstName")
        ? data.firstName
        : undefined;
    const lastName = isFieldVisible(fv, "lastName")
        ? data.lastName
        : undefined;
    const fullName = [firstName, lastName].filter(Boolean).join(" ");
    const jobTitle = isFieldVisible(fv, "jobTitle")
        ? data.jobTitle
        : undefined;

    const contactItems: React.ReactNode[] = [];

    if (isFieldVisible(fv, "email") && data.email) {
        contactItems.push(
            <ContactItem key="email" icon={Mail}>
                <a
                    href={`mailto:${data.email}`}
                    className="underline decoration-current/40 hover:decoration-current"
                >
                    {data.email}
                </a>
            </ContactItem>,
        );
    }
    if (isFieldVisible(fv, "phone") && data.phone) {
        contactItems.push(
            <ContactItem key="phone" icon={Phone}>
                {data.phone}
            </ContactItem>,
        );
    }
    if (
        (isFieldVisible(fv, "city") && data.city) ||
        (isFieldVisible(fv, "country") && data.country)
    ) {
        const loc = [
            isFieldVisible(fv, "city") ? data.city : null,
            isFieldVisible(fv, "country") ? data.country : null,
        ]
            .filter(Boolean)
            .join(", ");
        if (loc) {
            contactItems.push(
                <ContactItem key="loc" icon={MapPin}>
                    {loc}
                </ContactItem>,
            );
        }
    }
    if (isFieldVisible(fv, "linkedin") && data.linkedin) {
        contactItems.push(
            <ContactItem key="li" icon={Linkedin}>
                <a
                    href={data.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline decoration-current/40 hover:decoration-current"
                >
                    {shouldUseLinkLabel(fv, "linkedin")
                        ? "LinkedIn"
                        : data.linkedin}
                </a>
            </ContactItem>,
        );
    }
    if (isFieldVisible(fv, "website") && data.website) {
        contactItems.push(
            <ContactItem key="web" icon={Globe}>
                <a
                    href={data.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline decoration-current/40 hover:decoration-current"
                >
                    {shouldUseLinkLabel(fv, "website")
                        ? "Website"
                        : data.website}
                </a>
            </ContactItem>,
        );
    }

    const photoUrl = data.photoUrl;
    const borderStyle = data.borderStyle ?? "squircle";
    const photoBorderRadius =
        borderStyle === "circle"
            ? "50%"
            : borderStyle === "square"
              ? "0px"
              : "10%";

    if (!fullName && !jobTitle && contactItems.length === 0 && !photoUrl)
        return null;

    return (
        <div className="mb-[2px]">
            <div className="flex gap-3">
                {/* Photo */}
                {photoUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={photoUrl}
                        alt=""
                        className="h-[60px] w-[60px] shrink-0 object-cover"
                        style={{ borderRadius: photoBorderRadius }}
                    />
                )}
                <div className="flex-1">
                    {/* Name + designation */}
                    <div className="flex items-baseline gap-3">
                        <span className="text-[22px] font-bold leading-tight">
                            {fullName || "Your Name"}
                        </span>
                        {jobTitle && (
                            <span className="text-[13px] italic opacity-80">
                                {jobTitle}
                            </span>
                        )}
                    </div>

                    {/* Contact row */}
                    {contactItems.length > 0 && (
                        <div className="mt-[5px] flex flex-wrap items-center gap-x-3 gap-y-[2px] text-[9px] leading-snug">
                            {contactItems}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function ProfileBlock({ data }: { data: ResumeValues }) {
    if (!data.summary) return null;
    return (
        <div style={{ breakInside: "avoid" }}>
            <SectionHeading>Profile</SectionHeading>
            <p className="text-[10.5px] leading-[1.55]">{data.summary}</p>
        </div>
    );
}

function SkillsBlock({ data }: { data: ResumeValues }) {
    if (!data.skills || data.skills.length === 0) return null;
    // Render in multi-column bullet list (3 cols on wider, 2 on narrow)
    return (
        <div style={{ breakInside: "avoid" }}>
            <SectionHeading>Skills</SectionHeading>
            <ul
                className="columns-3 gap-x-4 text-[10px] leading-[1.6]"
                style={{ columnRule: "none" }}
            >
                {data.skills.map((skill, i) => (
                    <li key={i} className="break-inside-avoid pl-2">
                        <span className="mr-1.5">•</span>
                        {skill}
                    </li>
                ))}
            </ul>
        </div>
    );
}

function ExperienceBlock({ data }: { data: ResumeValues }) {
    const items = data.workExperiences?.filter((e) => e.visible !== false);
    if (!items || items.length === 0) return null;
    return (
        <div>
            <SectionHeading>Professional Experience</SectionHeading>
            <div className="space-y-[10px]">
                {items.map((exp, i) => (
                    <div
                        key={exp.id || i}
                        className="grid grid-cols-[110px_1fr] gap-x-3 text-[10.5px]"
                        style={{ breakInside: "avoid" }}
                    >
                        {/* Left col: dates + location */}
                        <div className="text-[9.5px] leading-[1.6] opacity-75">
                            {dateRange(exp.startDate, exp.endDate) && (
                                <div>{dateRange(exp.startDate, exp.endDate)}</div>
                            )}
                            {exp.location && <div>{exp.location}</div>}
                        </div>
                        {/* Right col: title, company, description */}
                        <div>
                            <p className="font-bold leading-snug">
                                {exp.position || "Position"}
                            </p>
                            {(exp.company || exp.subheading) && (
                                <p className="italic leading-snug opacity-80">
                                    {exp.company}
                                    {exp.subheading && exp.company
                                        ? ` · ${exp.subheading}`
                                        : exp.subheading || ""}
                                </p>
                            )}
                            {exp.description && (
                                <ul className="mt-[3px] space-y-[1px] text-[10px] leading-[1.55]">
                                    {exp.description
                                        .split("\n")
                                        .filter(Boolean)
                                        .map((line, j) => (
                                            <li
                                                key={j}
                                                className="pl-2"
                                            >
                                                <span className="mr-1">•</span>
                                                {line.replace(/^[•\-–]\s*/, "")}
                                            </li>
                                        ))}
                                </ul>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function EducationBlock({ data }: { data: ResumeValues }) {
    const items = data.educations?.filter((e) => e.visible !== false);
    if (!items || items.length === 0) return null;
    return (
        <div>
            <SectionHeading>Education</SectionHeading>
            <div className="space-y-[8px]">
                {items.map((edu, i) => (
                    <div
                        key={edu.id || i}
                        className="grid grid-cols-[110px_1fr] gap-x-3 text-[10.5px]"
                        style={{ breakInside: "avoid" }}
                    >
                        <div className="text-[9.5px] leading-[1.6] opacity-75">
                            {dateRange(edu.startDate, edu.endDate) && (
                                <div>
                                    {dateRange(edu.startDate, edu.endDate)}
                                </div>
                            )}
                            {edu.location && <div>{edu.location}</div>}
                        </div>
                        <div>
                            <p className="font-bold leading-snug">
                                {edu.degree || "Degree"}
                                {edu.fieldOfStudy &&
                                    ` in ${edu.fieldOfStudy}`}
                            </p>
                            <p className="italic leading-snug opacity-80">
                                {edu.school || "School"}
                                {edu.gpa && ` · GPA: ${edu.gpa}`}
                            </p>
                            {edu.description && (
                                <p className="mt-[2px] text-[10px] leading-[1.55]">
                                    {edu.description}
                                </p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function ProjectsBlock({ data }: { data: ResumeValues }) {
    const items = data.projects?.filter((p) => p.visible !== false);
    if (!items || items.length === 0) return null;
    return (
        <div>
            <SectionHeading>Personal Projects</SectionHeading>
            <div className="space-y-[10px]">
                {items.map((p, i) => (
                    <div
                        key={p.id || i}
                        className="grid grid-cols-[110px_1fr] gap-x-3 text-[10.5px]"
                        style={{ breakInside: "avoid" }}
                    >
                        <div className="text-[9.5px] leading-[1.6] opacity-75">
                            {dateRange(p.startDate, p.endDate) && (
                                <div>{dateRange(p.startDate, p.endDate)}</div>
                            )}
                        </div>
                        <div>
                            <p className="font-bold leading-snug">
                                {p.link ? (
                                    <a
                                        href={p.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="underline decoration-current/40 hover:decoration-current"
                                    >
                                        {p.title || "Project"}
                                        <ExternalLink className="ml-1 inline h-[9px] w-[9px] opacity-60" />
                                    </a>
                                ) : (
                                    p.title || "Project"
                                )}
                            </p>
                            {p.subtitle && (
                                <p className="italic leading-snug opacity-80">
                                    {p.subtitle}
                                </p>
                            )}
                            {p.description && (
                                <ul className="mt-[3px] space-y-[1px] text-[10px] leading-[1.55]">
                                    {p.description
                                        .split("\n")
                                        .filter(Boolean)
                                        .map((line, j) => (
                                            <li
                                                key={j}
                                                className="pl-2"
                                            >
                                                <span className="mr-1">•</span>
                                                {line.replace(/^[•\-–]\s*/, "")}
                                            </li>
                                        ))}
                                </ul>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function AwardsBlock({ data }: { data: ResumeValues }) {
    const items = data.awards?.filter((a) => a.visible !== false);
    if (!items || items.length === 0) return null;
    return (
        <div style={{ breakInside: "avoid" }}>
            <SectionHeading>Awards</SectionHeading>
            <div className="space-y-[6px]">
                {items.map((a, i) => (
                    <div
                        key={a.id || i}
                        className="grid grid-cols-[110px_1fr] gap-x-3 text-[10.5px]"
                    >
                        <div className="text-[9.5px] opacity-75">
                            {a.date && fmtDate(a.date)}
                        </div>
                        <div>
                            <p className="font-bold leading-snug">
                                {a.title || "Award"}
                            </p>
                            {a.issuer && (
                                <p className="italic opacity-80">
                                    {a.issuer}
                                </p>
                            )}
                            {a.description && (
                                <p className="mt-[2px] text-[10px] leading-[1.55]">
                                    {a.description}
                                </p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function PublicationsBlock({ data }: { data: ResumeValues }) {
    const items = data.publications?.filter((p) => p.visible !== false);
    if (!items || items.length === 0) return null;
    return (
        <div style={{ breakInside: "avoid" }}>
            <SectionHeading>Publications</SectionHeading>
            <div className="space-y-[6px]">
                {items.map((p, i) => (
                    <div
                        key={p.id || i}
                        className="grid grid-cols-[110px_1fr] gap-x-3 text-[10.5px]"
                    >
                        <div className="text-[9.5px] opacity-75">
                            {p.date && fmtDate(p.date)}
                        </div>
                        <div>
                            <p className="font-bold leading-snug">
                                {p.link ? (
                                    <a
                                        href={p.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="underline decoration-current/40 hover:decoration-current"
                                    >
                                        {p.title || "Publication"}
                                        <ExternalLink className="ml-1 inline h-[9px] w-[9px] opacity-60" />
                                    </a>
                                ) : (
                                    p.title || "Publication"
                                )}
                            </p>
                            {(p.publisher || p.authors) && (
                                <p className="italic opacity-80">
                                    {[p.authors, p.publisher]
                                        .filter(Boolean)
                                        .join(" · ")}
                                </p>
                            )}
                            {p.description && (
                                <p className="mt-[2px] text-[10px] leading-[1.55]">
                                    {p.description}
                                </p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function CertificatesBlock({ data }: { data: ResumeValues }) {
    const items = data.certificates?.filter((c) => c.visible !== false);
    if (!items || items.length === 0) return null;
    return (
        <div style={{ breakInside: "avoid" }}>
            <SectionHeading>Certificates</SectionHeading>
            <div className="space-y-[6px]">
                {items.map((c, i) => (
                    <div
                        key={c.id || i}
                        className="grid grid-cols-[110px_1fr] gap-x-3 text-[10.5px]"
                    >
                        <div className="text-[9.5px] opacity-75">
                            {c.date && fmtDate(c.date)}
                        </div>
                        <div>
                            <p className="font-bold leading-snug">
                                {c.link ? (
                                    <a
                                        href={c.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="underline decoration-current/40 hover:decoration-current"
                                    >
                                        {c.title || "Certificate"}
                                        <ExternalLink className="ml-1 inline h-[9px] w-[9px] opacity-60" />
                                    </a>
                                ) : (
                                    c.title || "Certificate"
                                )}
                            </p>
                            {c.issuer && (
                                <p className="italic opacity-80">
                                    {c.issuer}
                                </p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function LanguagesBlock({ data }: { data: ResumeValues }) {
    const items = data.languages?.filter((l) => l.visible !== false);
    if (!items || items.length === 0) return null;
    return (
        <div style={{ breakInside: "avoid" }}>
            <SectionHeading>Languages</SectionHeading>
            <div className="flex flex-wrap gap-x-4 gap-y-[2px] text-[10.5px]">
                {items.map((l, i) => (
                    <span key={l.id || i}>
                        <span className="font-semibold">
                            {l.language || "Language"}
                        </span>
                        {l.proficiency && (
                            <span className="opacity-75">
                                {" "}
                                ({l.proficiency})
                            </span>
                        )}
                    </span>
                ))}
            </div>
        </div>
    );
}

function CoursesBlock({ data }: { data: ResumeValues }) {
    const items = data.courses?.filter((c) => c.visible !== false);
    if (!items || items.length === 0) return null;
    return (
        <div style={{ breakInside: "avoid" }}>
            <SectionHeading>Courses</SectionHeading>
            <div className="space-y-[4px] text-[10.5px]">
                {items.map((c, i) => (
                    <div key={c.id || i}>
                        <span className="font-bold">{c.name || "Course"}</span>
                        {c.institution && (
                            <span className="italic opacity-80">
                                {" "}
                                — {c.institution}
                            </span>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

function ReferencesBlock({ data }: { data: ResumeValues }) {
    const items = data.references?.filter((r) => r.visible !== false);
    if (!items || items.length === 0) return null;
    return (
        <div style={{ breakInside: "avoid" }}>
            <SectionHeading>References</SectionHeading>
            <div className="space-y-[6px] text-[10.5px]">
                {items.map((r, i) => (
                    <div key={r.id || i}>
                        <p className="font-bold">
                            {r.name || "Reference"}
                        </p>
                        <p className="opacity-80">
                            {[r.position, r.company]
                                .filter(Boolean)
                                .join(" at ")}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}

function InterestsBlock({ data }: { data: ResumeValues }) {
    const items = data.interests?.filter((i) => i.visible !== false);
    if (!items || items.length === 0) return null;
    return (
        <div style={{ breakInside: "avoid" }}>
            <SectionHeading>Interests</SectionHeading>
            <p className="text-[10.5px]">
                {items.map((i) => i.name).filter(Boolean).join(" · ")}
            </p>
        </div>
    );
}

// Map section keys to renderers
const BLOCK_RENDERERS: Record<
    string,
    (props: { data: ResumeValues }) => React.ReactNode
> = {
    profile: ProfileBlock,
    experience: ExperienceBlock,
    education: EducationBlock,
    skills: SkillsBlock,
    projects: ProjectsBlock,
    awards: AwardsBlock,
    publications: PublicationsBlock,
    certificates: CertificatesBlock,
    languages: LanguagesBlock,
    courses: CoursesBlock,
    references: ReferencesBlock,
    interests: InterestsBlock,
};

// ---------------------------------------------------------------------------
// Exported template component
// ---------------------------------------------------------------------------

interface ResumeTemplateProps {
    resumeData: ResumeValues;
    /** Extra classes on the outer wrapper */
    className?: string;
    /** Override font-family CSS */
    fontFamily?: string;
}

export default function ResumeTemplate({
    resumeData,
    className,
    fontFamily,
}: ResumeTemplateProps) {
    const sectionOrder =
        resumeData.sectionOrder && resumeData.sectionOrder.length > 0
            ? resumeData.sectionOrder
            : DEFAULT_SECTION_ORDER;

    const sv = resumeData.sectionVisibility;

    return (
        <div
            className={className}
            style={{
                fontFamily:
                    fontFamily ||
                    'Georgia, "Times New Roman", "Noto Serif", serif',
                color: resumeData.colorHex || "#000000",
                overflowWrap: "break-word",
                wordBreak: "break-word",
            }}
        >
            {/* Header */}
            {isSectionVisible(sv, "personal-info") && (
                <HeaderBlock data={resumeData} />
            )}

            {/* Sections in order */}
            {sectionOrder.map((key) => {
                if (key === "personal-info") return null;
                if (!isSectionVisible(sv, key)) return null;
                const Renderer = BLOCK_RENDERERS[key];
                if (!Renderer) return null;
                return <Renderer key={key} data={resumeData} />;
            })}
        </div>
    );
}
