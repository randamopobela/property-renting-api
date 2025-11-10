import { config } from "dotenv";
import { resolve } from "path";
import { Prisma } from "@prisma/client";

export const NODE_ENV = process.env.NODE_ENV || "development";
const envFile = NODE_ENV === "development" ? "../.env.local" : ".env";

config({ path: resolve(__dirname, `../../${envFile}`), override: true });

export const dbURL = process.env.DATABASE_URL || "";

// export const prisma = {
//     schema: "src/prisma/schema.prisma",
//     migrations: {
//         path: "src/prisma/migrations",
//     },
//     engine: "classic",
// }
