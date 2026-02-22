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
import { cn } from "@/lib/utils";

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
// Components
// ---------------------------------------------------------------------------

function SectionHeading({
    children,
    layout,
}: {
    children: React.ReactNode;
    layout?: string;
}) {
    // Professional/Simple: Line + Uppercase
    // Modern: Icon + Uppercase (handled in block maybe? or just style here)
    // Creative: Bubble font?

    if (layout === "two-column") {
        return (
            <div className="mb-2 mt-4">
                <h3 className="border-b-2 border-current pb-1 text-[13px] font-black uppercase tracking-wider">
                    {children}
                </h3>
            </div>
        );
    }

    return (
        <div className="mb-[6px] mt-[14px] flex items-baseline gap-2">
            <h3 className="whitespace-nowrap text-[11.5px] font-bold uppercase tracking-[0.08em]">
                {children}
            </h3>
            <div className="h-px flex-1 bg-current opacity-80" />
        </div>
    );
}

function ContactItem({
    icon: Icon,
    children,
}: {
    icon: React.ComponentType<{ className?: string }>;
    children: React.ReactNode;
}) {
    return (
        <span className="inline-flex items-center gap-[4px]">
            <Icon className="h-[10px] w-[10px] shrink-0 opacity-70" />
            <span>{children}</span>
        </span>
    );
}

// ---------------------------------------------------------------------------
// Block Renderers
// ---------------------------------------------------------------------------

interface BlockProps {
    data: ResumeValues;
    layout?: string;
}

function HeaderBlock({ data, layout }: BlockProps) {
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

    if (!fullName && !jobTitle && contactItems.length === 0 && !photoUrl)
        return null;

    // Two-column layout header (Sidebar style handled via CSS grid in parent, but inner content here)
    if (layout === "two-column") {
        return (
            <div className="mb-6 text-center">
                {photoUrl && (
                    <img
                        src={photoUrl}
                        alt=""
                        className="mx-auto mb-4 h-32 w-32 rounded-full border-4 border-white object-cover shadow-sm"
                    />
                )}
                <div>
                    <h1 className="mb-2 text-[26px] font-black leading-none tracking-tight">
                        {fullName || "Your Name"}
                    </h1>
                    {jobTitle && (
                        <p className="mb-4 text-[14px] font-medium italic opacity-90">
                            {jobTitle}
                        </p>
                    )}
                    {contactItems.length > 0 && (
                        <div className="flex flex-col gap-1.5 text-[10px] opacity-90">
                            {contactItems}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Single / Split-Date Layout Header
    return (
        <div className="mb-[18px]">
            <div className="flex items-start gap-5">
                {/* Photo (optional) */}
                {photoUrl && (
                    <img
                        src={photoUrl}
                        alt=""
                        className="h-[68px] w-[68px] shrink-0 rounded-full object-cover"
                    />
                )}
                <div className="flex-1">
                    {/* Name + designation */}
                    <div className="flex flex-col gap-1">
                        <span className="text-[28px] font-bold leading-none tracking-tight">
                            {fullName || "Your Name"}
                        </span>
                        {jobTitle && (
                            <span className="text-[14px] font-medium text-current/80">
                                {jobTitle}
                            </span>
                        )}
                    </div>

                    {/* Contact row */}
                    {contactItems.length > 0 && (
                        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] leading-snug text-current/75">
                            {contactItems}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function ProfileBlock({ data, layout }: BlockProps) {
    if (!data.summary) return null;
    return (
        <div style={{ breakInside: "avoid" }}>
            <SectionHeading layout={layout}>Profile</SectionHeading>
            <p className="text-[10.5px] leading-[1.6] opacity-90">
                {data.summary}
            </p>
        </div>
    );
}

function SkillsBlock({ data, layout }: BlockProps) {
    if (!data.skills || data.skills.length === 0) return null;

    if (layout === "two-column") {
        return (
            <div style={{ breakInside: "avoid" }}>
                <SectionHeading layout={layout}>Skills</SectionHeading>
                <div className="flex flex-wrap gap-1.5">
                    {data.skills.map((skill, i) => (
                        <span
                            key={`${skill}-${i}`}
                            className="rounded-sm bg-current/10 px-1.5 py-0.5 text-[9.5px] font-semibold"
                        >
                            {skill}
                        </span>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div style={{ breakInside: "avoid" }}>
            <SectionHeading layout={layout}>Skills</SectionHeading>
            <ul
                className="columns-3 gap-x-6 text-[10.5px] leading-[1.6]"
                style={{ columnRule: "none" }}
            >
                {data.skills.map((skill, i) => (
                    <li key={`${skill}-${i}`} className="break-inside-avoid pl-2">
                        <span className="mr-1.5 opacity-60">•</span>
                        {skill}
                    </li>
                ))}
            </ul>
        </div>
    );
}

function ExperienceBlock({ data, layout }: BlockProps) {
    const items = data.workExperiences?.filter((e) => e.visible !== false);
    if (!items || items.length === 0) return null;

    // Split Date Layout (Simple) vs Single/Two Column
    // In Simple, dates are on the left (grid-cols-[110px_1fr])
    // In Professional, dates are usually right-aligned or subtitle
    // In Two Column, space is tight, so maybe subtitle

    const isSplitDate = layout === "split-date";

    return (
        <div>
            <SectionHeading layout={layout}>
                Professional Experience
            </SectionHeading>
            <div className="space-y-4">
                {items.map((exp, i) => (
                    <div
                        key={exp.id || i}
                        className={cn(
                            "group",
                            isSplitDate
                                ? "grid grid-cols-[90px_1fr] gap-x-4"
                                : "block",
                        )}
                        style={{ breakInside: "avoid" }}
                    >
                        {/* Dates (Left for split-date) */}
                        {isSplitDate && (
                            <div className="pt-[1.5px] text-right text-[9.5px] font-medium opacity-70">
                                {dateRange(exp.startDate, exp.endDate) && (
                                    <div>
                                        {dateRange(exp.startDate, exp.endDate)}
                                    </div>
                                )}
                                {exp.location && (
                                    <div className="mt-0.5 opacity-80">
                                        {exp.location}
                                    </div>
                                )}
                            </div>
                        )}

                        <div>
                            {/* Header Row */}
                            <div className="flex flex-wrap items-baseline justify-between gap-x-2">
                                <h4 className="text-[11px] font-bold">
                                    {exp.position || "Position"}
                                </h4>
                                {!isSplitDate &&
                                    dateRange(exp.startDate, exp.endDate) && (
                                        <span className="text-[10px] font-medium opacity-70">
                                            {dateRange(
                                                exp.startDate,
                                                exp.endDate,
                                            )}
                                        </span>
                                    )}
                            </div>

                            {/* Subheader */}
                            <div className="mb-1 flex flex-wrap items-center justify-between gap-x-2 text-[10.5px]">
                                <span className="font-semibold italic opacity-90">
                                    {exp.company}
                                    {exp.subheading && ` · ${exp.subheading}`}
                                </span>
                                {!isSplitDate && exp.location && (
                                    <span className="opacity-70">
                                        {exp.location}
                                    </span>
                                )}
                            </div>

                            {/* Description */}
                            {exp.description && (
                                <ul className="space-y-[2px] text-[10px] leading-[1.5]">
                                    {exp.description
                                        .split("\n")
                                        .filter(Boolean)
                                        .map((line, j) => (
                                            <li
                                                key={j}
                                                className="relative pl-3 opacity-90"
                                            >
                                                <span className="absolute left-0 top-[5px] h-[3px] w-[3px] rounded-full bg-current opacity-60" />
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

function EducationBlock({ data, layout }: BlockProps) {
    const items = data.educations?.filter((e) => e.visible !== false);
    if (!items || items.length === 0) return null;

    const isSplitDate = layout === "split-date";

    return (
        <div>
            <SectionHeading layout={layout}>Education</SectionHeading>
            <div className="space-y-3">
                {items.map((edu, i) => (
                    <div
                        key={edu.id || i}
                        className={cn(
                            isSplitDate
                                ? "grid grid-cols-[90px_1fr] gap-x-4"
                                : "block",
                        )}
                        style={{ breakInside: "avoid" }}
                    >
                        {isSplitDate && (
                            <div className="pt-[1.5px] text-right text-[9.5px] font-medium opacity-70">
                                {dateRange(edu.startDate, edu.endDate) && (
                                    <div>
                                        {dateRange(edu.startDate, edu.endDate)}
                                    </div>
                                )}
                                {edu.location && (
                                    <div className="mt-0.5 opacity-80">
                                        {edu.location}
                                    </div>
                                )}
                            </div>
                        )}

                        <div>
                            <div className="flex flex-wrap items-baseline justify-between gap-x-2">
                                <h4 className="text-[11px] font-bold">
                                    {edu.school || "School"}
                                </h4>
                                {!isSplitDate &&
                                    dateRange(edu.startDate, edu.endDate) && (
                                        <span className="text-[10px] font-medium opacity-70">
                                            {dateRange(
                                                edu.startDate,
                                                edu.endDate,
                                            )}
                                        </span>
                                    )}
                            </div>
                            <div className="mb-0.5 text-[10.5px]">
                                <span className="font-medium italic opacity-90">
                                    {edu.degree}
                                </span>
                                {edu.fieldOfStudy && (
                                    <span className="opacity-90">
                                        {" "}
                                        in {edu.fieldOfStudy}
                                    </span>
                                )}
                                {edu.gpa && (
                                    <span className="ml-2 opacity-75">
                                        GPA: {edu.gpa}
                                    </span>
                                )}
                            </div>
                            {edu.description && (
                                <p className="text-[10px] leading-[1.5] opacity-85 hover:opacity-100">
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

function ProjectsBlock({ data, layout }: BlockProps) {
    const items = data.projects?.filter((p) => p.visible !== false);
    if (!items || items.length === 0) return null;
    const isSplitDate = layout === "split-date";

    return (
        <div>
            <SectionHeading layout={layout}>Personal Projects</SectionHeading>
            <div className="space-y-3">
                {items.map((p, i) => (
                    <div
                        key={p.id || i}
                        className={cn(
                            isSplitDate
                                ? "grid grid-cols-[90px_1fr] gap-x-4"
                                : "block",
                        )}
                        style={{ breakInside: "avoid" }}
                    >
                        {isSplitDate && (
                            <div className="pt-[1.5px] text-right text-[9.5px] font-medium opacity-70">
                                {dateRange(p.startDate, p.endDate) && (
                                    <div>
                                        {dateRange(p.startDate, p.endDate)}
                                    </div>
                                )}
                            </div>
                        )}

                        <div>
                            <div className="flex flex-wrap items-baseline justify-between gap-x-2">
                                <h4 className="text-[11px] font-bold">
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
                                </h4>
                                {!isSplitDate &&
                                    dateRange(p.startDate, p.endDate) && (
                                        <span className="text-[10px] font-medium opacity-70">
                                            {dateRange(p.startDate, p.endDate)}
                                        </span>
                                    )}
                            </div>
                            {p.subtitle && (
                                <p className="mb-0.5 text-[10.5px] font-medium italic opacity-85">
                                    {p.subtitle}
                                </p>
                            )}
                            {p.description && (
                                <ul className="space-y-[2px] text-[10px] leading-[1.5]">
                                    {p.description
                                        .split("\n")
                                        .filter(Boolean)
                                        .map((line, j) => (
                                            <li
                                                key={j}
                                                className="relative pl-3 opacity-90"
                                            >
                                                <span className="absolute left-0 top-[5px] h-[3px] w-[3px] rounded-full bg-current opacity-60" />
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

function AwardsBlock({ data, layout }: BlockProps) {
    const items = data.awards?.filter((a) => a.visible !== false);
    if (!items || items.length === 0) return null;
    return (
        <div style={{ breakInside: "avoid" }}>
            <SectionHeading layout={layout}>Awards</SectionHeading>
            <div className="space-y-2">
                {items.map((a, i) => (
                    <div
                        key={a.id || i}
                        className="grid grid-cols-[80px_1fr] gap-x-3 text-[10.5px]"
                    >
                        <div className="text-[9.5px] opacity-70">
                            {a.date && fmtDate(a.date)}
                        </div>
                        <div>
                            <p className="font-bold leading-snug">
                                {a.title || "Award"}
                            </p>
                            {a.issuer && (
                                <p className="italic opacity-80">{a.issuer}</p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function PublicationsBlock({ data, layout }: BlockProps) {
    const items = data.publications?.filter((p) => p.visible !== false);
    if (!items || items.length === 0) return null;
    return (
        <div style={{ breakInside: "avoid" }}>
            <SectionHeading layout={layout}>Publications</SectionHeading>
            <div className="space-y-2">
                {items.map((p, i) => (
                    <div key={p.id || i} className="text-[10.5px]">
                        <p className="font-bold leading-snug">
                            {p.link ? (
                                <a
                                    href={p.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="underline decoration-current/40 hover:decoration-current"
                                >
                                    {p.title || "Publication"}
                                </a>
                            ) : (
                                p.title || "Publication"
                            )}
                            {p.date && (
                                <span className="ml-2 font-normal opacity-70">
                                    ({fmtDate(p.date)})
                                </span>
                            )}
                        </p>
                        {(p.publisher || p.authors) && (
                            <p className="italic opacity-80">
                                {[p.authors, p.publisher]
                                    .filter(Boolean)
                                    .join(" · ")}
                            </p>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

function CertificatesBlock({ data, layout }: BlockProps) {
    const items = data.certificates?.filter((c) => c.visible !== false);
    if (!items || items.length === 0) return null;
    return (
        <div style={{ breakInside: "avoid" }}>
            <SectionHeading layout={layout}>Certificates</SectionHeading>
            <div className="space-y-1.5">
                {items.map((c, i) => (
                    <div key={c.id || i} className="text-[10.5px]">
                        <p className="font-bold leading-snug">
                            {c.link ? (
                                <a
                                    href={c.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="underline decoration-current/40 hover:decoration-current"
                                >
                                    {c.title || "Certificate"}
                                </a>
                            ) : (
                                c.title || "Certificate"
                            )}
                        </p>
                        <div className="flex gap-2 text-[9.5px] opacity-75">
                            {c.date && <span>{fmtDate(c.date)}</span>}
                            {c.issuer && <span>{c.issuer}</span>}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function LanguagesBlock({ data, layout }: BlockProps) {
    const items = data.languages?.filter((l) => l.visible !== false);
    if (!items || items.length === 0) return null;
    return (
        <div style={{ breakInside: "avoid" }}>
            <SectionHeading layout={layout}>Languages</SectionHeading>
            <div className="flex flex-col gap-1 text-[10px]">
                {items.map((l, i) => (
                    <div key={l.id || i} className="flex justify-between">
                        <span className="font-semibold">
                            {l.language || "Language"}
                        </span>
                        {l.proficiency && (
                            <span className="opacity-75">{l.proficiency}</span>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

function CoursesBlock({ data, layout }: BlockProps) {
    const items = data.courses?.filter((c) => c.visible !== false);
    if (!items || items.length === 0) return null;
    return (
        <div style={{ breakInside: "avoid" }}>
            <SectionHeading layout={layout}>Courses</SectionHeading>
            <div className="space-y-1 text-[10.5px]">
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

function ReferencesBlock({ data, layout }: BlockProps) {
    const items = data.references?.filter((r) => r.visible !== false);
    if (!items || items.length === 0) return null;
    return (
        <div style={{ breakInside: "avoid" }}>
            <SectionHeading layout={layout}>References</SectionHeading>
            <div className="space-y-2 text-[10.5px]">
                {items.map((r, i) => (
                    <div key={r.id || i}>
                        <p className="font-bold">{r.name || "Reference"}</p>
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

function InterestsBlock({ data, layout }: BlockProps) {
    const items = data.interests?.filter((i) => i.visible !== false);
    if (!items || items.length === 0) return null;
    return (
        <div style={{ breakInside: "avoid" }}>
            <SectionHeading layout={layout}>Interests</SectionHeading>
            <p className="text-[10.5px]">
                {items.map((i) => i.name).filter(Boolean).join(" · ")}
            </p>
        </div>
    );
}

// Map section keys to renderers
const BLOCK_RENDERERS: Record<
    string,
    (props: BlockProps) => React.ReactNode
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
    const layout = (resumeData as any).layout || "single-column";

    // -----------------------------------------------------------------------
    // Two-Column Layout Implementation
    // -----------------------------------------------------------------------
    if (layout === "two-column") {
        const leftColumnSections = [
            "skills",
            "contact",
            "languages",
            "certifications",
            "awards",
            "interests",
        ]; // Heuristic for left column
        // We'll actually iterate the sectionOrder and direct them to left (sidebar) or right (main)
        // Sidebar usually contains: Header (sometimes), Skills, Languages, Contact, References
        // Main contains: Profile, Experience, Education, Projects

        return (
            <div
                className={cn("grid h-full grid-cols-[32%_1fr]", className)}
                style={{
                    fontFamily:
                        fontFamily ||
                        'Georgia, "Times New Roman", "Noto Serif", serif',
                    color: resumeData.colorHex || "#000000",
                }}
            >
                {/* Left Sidebar */}
                <div className="flex flex-col gap-6 bg-current px-5 py-8 text-white">
                    {/* Header in sidebar for two-column? "Creative" had it there. "Modern" had it top. 
                        Let's put Header in Sidebar for now as per "Creative" analysis. 
                     */}
                    <div style={{ color: "white" }}>
                        <HeaderBlock data={resumeData} layout={layout} />

                        {sectionOrder.map((key) => {
                            // Render specific small sections in sidebar
                            if (
                                [
                                    "skills",
                                    "languages",
                                    "interests",
                                    "awards",
                                    "certificates",
                                    "references",
                                ].includes(key) &&
                                isSectionVisible(sv, key)
                            ) {
                                const Renderer = BLOCK_RENDERERS[key];
                                return (
                                    <div key={key} className="mt-6">
                                        {Renderer && (
                                            <Renderer
                                                data={resumeData}
                                                layout={layout}
                                            />
                                        )}
                                    </div>
                                );
                            }
                            return null;
                        })}
                    </div>
                </div>

                {/* Right Main Content */}
                <div className="flex flex-col gap-4 bg-white p-8 text-black">
                    {sectionOrder.map((key) => {
                        // Render main bulky sections here
                        if (
                            [
                                "personal-info", // Skip, handled effectively by HeaderBlock
                                "profile",
                                "experience",
                                "education",
                                "projects",
                                "courses",
                                "publications",
                            ].includes(key) &&
                            isSectionVisible(sv, key)
                        ) {
                            if (key === "personal-info") return null; // Already rendered
                            const Renderer = BLOCK_RENDERERS[key];
                            return (
                                <Renderer
                                    key={key}
                                    data={resumeData}
                                    layout={layout}
                                />
                            );
                        }
                        return null;
                    })}
                </div>
            </div>
        );
    }

    // -----------------------------------------------------------------------
    // Default (Single Column / Split Date)
    // -----------------------------------------------------------------------

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
                <HeaderBlock data={resumeData} layout={layout} />
            )}

            {/* Sections in order */}
            {sectionOrder.map((key) => {
                if (key === "personal-info") return null;
                if (!isSectionVisible(sv, key)) return null;
                const Renderer = BLOCK_RENDERERS[key];
                if (!Renderer) return null;
                return (
                    <Renderer key={key} data={resumeData} layout={layout} />
                );
            })}
        </div>
    );
}
