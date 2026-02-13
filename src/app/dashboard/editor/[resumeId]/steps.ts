import type { ComponentType } from "react";
import type { EditorFormProps } from "@/lib/types";
import PersonalInfoForm from "./forms/PersonalInfoForm";
import WorkExperienceForm from "./forms/WorkExperienceForm";
import EducationForm from "./forms/EducationForm";
import SkillsForm from "./forms/SkillsForm";
import SummaryForm from "./forms/SummaryForm";

export interface Step {
    title: string;
    key: string;
    component: ComponentType<EditorFormProps>;
    description: string;
}

export const steps: Step[] = [
    {
        title: "Personal Info",
        key: "personal-info",
        component: PersonalInfoForm,
        description: "Add your contact details",
    },
    {
        title: "Work Experience",
        key: "work-experience",
        component: WorkExperienceForm,
        description: "Add your work history",
    },
    {
        title: "Education",
        key: "education",
        component: EducationForm,
        description: "Add your education background",
    },
    {
        title: "Skills",
        key: "skills",
        component: SkillsForm,
        description: "Highlight your key skills",
    },
    {
        title: "Summary",
        key: "summary",
        component: SummaryForm,
        description: "Write a professional summary",
    },
];
