import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
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
} as const;
