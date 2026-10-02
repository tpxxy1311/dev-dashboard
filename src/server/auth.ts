// src/server/auth.ts
import "server-only";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db";
import { nextCookies } from "better-auth/next-js";
import * as schema from "./db/schema";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      scope: ["read:user", "user:email"],
    },
    spotify: {
      clientId: process.env.SPOTIFY_CLIENT_ID!,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET!,
      scope: ["user-read-currently-playing", "user-read-recently-played"],
    },
  },
  account: {
    accountLinking: { enabled: true, allowDifferentEmails: true, trustedProviders: ["spotify"], },
  },
  // Applies cookies set by auth.api.* calls in Server Actions. Must stay last.
  plugins: [nextCookies()],
});
