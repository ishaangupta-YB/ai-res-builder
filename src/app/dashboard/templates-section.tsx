"use client";

import Image from "next/image";
import { Card } from "@/components/ui/card";

const templates = [
    {
        name: "Professional",
        description: "Classic single-column layout for corporate roles",
        image: "/templates/professional.png",
    },
    {
        name: "Creative",
        description: "Bold two-column layout with colorful sidebar",
        image: "/templates/creative.png",
    },
    {
        name: "Modern",
        description: "Clean two-column layout with photo header",
        image: "/templates/modern.png",
    },
    {
        name: "Simple",
        description: "Elegant split-date layout with left-margin dates",
        image: "/templates/simple.png",
    },
];

export default function TemplatesSection() {
    return (
        <div className="mt-12">
            <h2 className="mb-4 text-2xl font-bold">Templates</h2>
            <p className="mb-6 text-muted-foreground">
                Choose a template to get started quickly
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {templates.map((template) => (
                    <Card
                        key={template.name}
                        className="group relative cursor-default overflow-hidden p-0 transition-all hover:shadow-md hover:-translate-y-1"
                    >
                        {/* Resume image */}
                        <div
                            className="relative w-full overflow-hidden bg-white"
                            style={{ aspectRatio: "210 / 297" }}
                        >
                            <Image
                                src={template.image}
                                alt={`${template.name} resume template`}
                                fill
                                className="object-cover object-top"
                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                            />

                            {/* Coming Soon overlay */}
                            <div className="absolute inset-0 flex items-center justify-center bg-foreground/0 transition-all group-hover:bg-foreground/60">
                                <span className="translate-y-4 rounded-none border-2 border-background bg-primary px-4 py-2 text-sm font-bold uppercase tracking-wider text-primary-foreground opacity-0 shadow-[3px_3px_0px_0px_var(--color-background)] transition-all group-hover:translate-y-0 group-hover:opacity-100">
                                    Coming Soon
                                </span>
                            </div>
                        </div>

                        {/* Card info */}
                        <div className="p-3">
                            <h3 className="text-sm font-medium">
                                {template.name}
                            </h3>
                            <p className="text-xs text-muted-foreground">
                                {template.description}
                            </p>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}
