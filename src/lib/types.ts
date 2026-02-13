import type { Dispatch, SetStateAction } from "react";
import type { resumes, workExperiences, educations } from "@/db/schema";
import type { ResumeValues } from "./validation";

export type Resume = typeof resumes.$inferSelect;
export type WorkExperience = typeof workExperiences.$inferSelect;
export type Education = typeof educations.$inferSelect;

export interface ResumeServerData extends Resume {
    workExperiences: WorkExperience[];
    educations: Education[];
}

export interface EditorFormProps {
    resumeData: ResumeValues;
    setResumeData: Dispatch<SetStateAction<ResumeValues>>;
}
