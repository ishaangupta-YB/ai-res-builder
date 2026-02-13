import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { ResumeServerData } from "./types";
import type { ResumeValues } from "./validation";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function mapToResumeValues(data: ResumeServerData): ResumeValues {
    return {
        id: data.id,
        title: data.title ?? undefined,
        description: data.description ?? undefined,
        photoUrl: data.photoUrl ?? undefined,
        colorHex: data.colorHex,
        borderStyle: data.borderStyle,
        summary: data.summary ?? undefined,
        firstName: data.firstName ?? undefined,
        lastName: data.lastName ?? undefined,
        jobTitle: data.jobTitle ?? undefined,
        city: data.city ?? undefined,
        country: data.country ?? undefined,
        phone: data.phone ?? undefined,
        email: data.email ?? undefined,
        skills: data.skills ?? undefined,
        workExperiences: data.workExperiences.map((exp) => ({
            id: exp.id,
            position: exp.position ?? undefined,
            company: exp.company ?? undefined,
            startDate: exp.startDate
                ? exp.startDate.toISOString().split("T")[0]
                : undefined,
            endDate: exp.endDate
                ? exp.endDate.toISOString().split("T")[0]
                : undefined,
            description: exp.description ?? undefined,
        })),
        educations: data.educations.map((edu) => ({
            id: edu.id,
            degree: edu.degree ?? undefined,
            school: edu.school ?? undefined,
            startDate: edu.startDate
                ? edu.startDate.toISOString().split("T")[0]
                : undefined,
            endDate: edu.endDate
                ? edu.endDate.toISOString().split("T")[0]
                : undefined,
        })),
    };
}
