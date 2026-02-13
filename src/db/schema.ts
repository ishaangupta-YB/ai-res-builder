import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql, relations } from "drizzle-orm";
import * as authSchema from "./auth.schema";

export const resumes = sqliteTable("resumes", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id").notNull(),

    title: text("title"),
    description: text("description"),

    photoUrl: text("photo_url"),
    colorHex: text("color_hex").notNull().default("#000000"),
    borderStyle: text("border_style").notNull().default("squircle"),
    summary: text("summary"),
    firstName: text("first_name"),
    lastName: text("last_name"),
    jobTitle: text("job_title"),
    city: text("city"),
    country: text("country"),
    phone: text("phone"),
    email: text("email"),

    // SQLite has no array type — store as JSON string
    skills: text("skills", { mode: "json" }).$type<string[]>().default([]),

    createdAt: integer("created_at", { mode: "timestamp" })
        .notNull()
        .default(sql`(unixepoch())`),
    updatedAt: integer("updated_at", { mode: "timestamp" })
        .notNull()
        .default(sql`(unixepoch())`)
        .$onUpdateFn(() => new Date()),
});

export const resumesRelations = relations(resumes, ({ many }) => ({
    workExperiences: many(workExperiences),
    educations: many(educations),
}));

export const workExperiences = sqliteTable("work_experiences", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),

    position: text("position"),
    company: text("company"),
    startDate: integer("start_date", { mode: "timestamp" }),
    endDate: integer("end_date", { mode: "timestamp" }),
    description: text("description"),

    resumeId: text("resume_id")
        .notNull()
        .references(() => resumes.id, { onDelete: "cascade" }),

    createdAt: integer("created_at", { mode: "timestamp" })
        .notNull()
        .default(sql`(unixepoch())`),
    updatedAt: integer("updated_at", { mode: "timestamp" })
        .notNull()
        .default(sql`(unixepoch())`)
        .$onUpdateFn(() => new Date()),
});

export const workExperiencesRelations = relations(workExperiences, ({ one }) => ({
    resume: one(resumes, {
        fields: [workExperiences.resumeId],
        references: [resumes.id],
    }),
}));

export const educations = sqliteTable("educations", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),

    degree: text("degree"),
    school: text("school"),
    startDate: integer("start_date", { mode: "timestamp" }),
    endDate: integer("end_date", { mode: "timestamp" }),

    resumeId: text("resume_id")
        .notNull()
        .references(() => resumes.id, { onDelete: "cascade" }),

    createdAt: integer("created_at", { mode: "timestamp" })
        .notNull()
        .default(sql`(unixepoch())`),
    updatedAt: integer("updated_at", { mode: "timestamp" })
        .notNull()
        .default(sql`(unixepoch())`)
        .$onUpdateFn(() => new Date()),
});

export const educationsRelations = relations(educations, ({ one }) => ({
    resume: one(resumes, {
        fields: [educations.resumeId],
        references: [resumes.id],
    }),
}));

export const userSubscriptions = sqliteTable("user_subscriptions", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id").notNull().unique(),
    stripeCustomerId: text("stripe_customer_id").notNull().unique(),
    stripeSubscriptionId: text("stripe_subscription_id").notNull().unique(),
    stripePriceId: text("stripe_price_id").notNull(),
    stripeCurrentPeriodEnd: integer("stripe_current_period_end", { mode: "timestamp" }).notNull(),
    stripeCancelAtPeriodEnd: integer("stripe_cancel_at_period_end", { mode: "boolean" })
        .notNull()
        .default(false),

    createdAt: integer("created_at", { mode: "timestamp" })
        .notNull()
        .default(sql`(unixepoch())`),
    updatedAt: integer("updated_at", { mode: "timestamp" })
        .notNull()
        .default(sql`(unixepoch())`)
        .$onUpdateFn(() => new Date()),
});

// Combine all schemas here for migrations
export const schema = {
    ...authSchema,
    resumes,
    resumesRelations,
    workExperiences,
    workExperiencesRelations,
    educations,
    educationsRelations,
    userSubscriptions,
} as const;
