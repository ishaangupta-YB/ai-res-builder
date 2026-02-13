import { z } from "zod";

const optionalString = z.string().trim().max(200).optional();

const workExperienceSchema = z.object({
    id: z.string().optional(),
    position: optionalString,
    company: optionalString,
    startDate: z.string().max(10).optional(), // YYYY-MM-DD
    endDate: z.string().max(10).optional(),
    description: z.string().trim().max(2000).optional(),
});

const educationSchema = z.object({
    id: z.string().optional(),
    degree: optionalString,
    school: optionalString,
    startDate: z.string().max(10).optional(),
    endDate: z.string().max(10).optional(),
});

export const resumeSchema = z.object({
    id: z.string().optional(),
    title: z.string().trim().max(200).optional(),
    description: z.string().trim().max(500).optional(),
    photoUrl: z.string().trim().max(500).url().optional().or(z.literal("")),
    colorHex: z
        .string()
        .max(9)
        .regex(/^#[0-9a-fA-F]{3,8}$/)
        .optional(),
    borderStyle: z.string().max(50).optional(),
    summary: z.string().trim().max(1000).optional(),
    firstName: optionalString,
    lastName: optionalString,
    jobTitle: optionalString,
    city: optionalString,
    country: optionalString,
    phone: z.string().trim().max(30).optional(),
    email: z.string().trim().max(200).email().optional().or(z.literal("")),
    skills: z.array(z.string().trim().max(100)).max(50).optional(),
    workExperiences: z.array(workExperienceSchema).max(20).optional(),
    educations: z.array(educationSchema).max(20).optional(),
});

export type ResumeValues = z.infer<typeof resumeSchema>;
