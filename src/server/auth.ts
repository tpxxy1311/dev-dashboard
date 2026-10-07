// src/server/auth.ts
import "server-only";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { genericOAuth } from "better-auth/plugins/generic-oauth";
import { db } from "./db";
import { nextCookies } from "better-auth/next-js";
import * as schema from "./db/schema";
import { userResponseSchema } from "@/lib/validations/wakatime";

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
    accountLinking: {
      enabled: true,
      allowDifferentEmails: true,
      trustedProviders: ["spotify", "wakatime"],
    },
  },
  plugins: [
    // WakaTime is not built into Better Auth, so it is registered as a
    // generic OAuth provider. It then works like a social provider
    // (linkSocial, callback/wakatime, getAccessToken).
    genericOAuth({
      config: [
        {
          providerId: "wakatime",
          clientId: process.env.WAKATIME_CLIENT_ID!,
          clientSecret: process.env.WAKATIME_CLIENT_SECRET!,
          authorizationUrl: "https://wakatime.com/oauth/authorize",
          tokenUrl: "https://wakatime.com/oauth/token",
          scopes: ["email", "read_summaries", "read_stats"],
          // WakaTime has no OIDC userinfo endpoint, so the profile is read
          // from the users API.
          getUserInfo: async (tokens) => {
            const res = await fetch(
              "https://wakatime.com/api/v1/users/current",
              { headers: { Authorization: `Bearer ${tokens.accessToken}` } },
            );
            if (!res.ok) return null;

            const { data } = userResponseSchema.parse(await res.json());
            return {
              id: data.id,
              email: data.email,
              emailVerified: false,
              name: data.display_name,
              image: data.photo ?? undefined,
            };
          },
        },
      ],
    }),
    // Applies cookies set by auth.api.* calls in Server Actions. Must stay last.
    nextCookies(),
  ],
});
