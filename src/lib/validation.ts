import { z } from "zod";

const workExperienceSchema = z.object({
    id: z.string().optional(),
    position: z.string().optional(),
    company: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    description: z.string().optional(),
});

const educationSchema = z.object({
    id: z.string().optional(),
    degree: z.string().optional(),
    school: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
});

export const resumeSchema = z.object({
    id: z.string().optional(),
    title: z.string().optional(),
    description: z.string().optional(),
    photoUrl: z.string().optional(),
    colorHex: z.string().optional(),
    borderStyle: z.string().optional(),
    summary: z.string().optional(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    jobTitle: z.string().optional(),
    city: z.string().optional(),
    country: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().optional(),
    skills: z.array(z.string()).optional(),
    workExperiences: z.array(workExperienceSchema).optional(),
    educations: z.array(educationSchema).optional(),
});

export type ResumeValues = z.infer<typeof resumeSchema>;
