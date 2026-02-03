import { betterAuth, logger } from "better-auth";
import React from "react";
import { render } from "@react-email/render";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { createAuthMiddleware } from "better-auth/api";
import { openAPI } from "better-auth/plugins";
import { publishEmailJob } from "../../jobs/qstash";
import { env } from "../../config/environments";
import { prisma } from "../../lib/prisma";
import { VerifyEmail } from "../../templates/emails/VerifyEmail";
import ResetPasswordEmail from "../../templates/emails/PasswordReset";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql"
  }),
  trustedOrigins: [
    env.CLIENT_URL ?? process.env.CLIENT_URL,
    "http://localhost:5173",
    "http://localhost:3000",
    "http://localhost:4000"
  ].filter(Boolean) as string[],

  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url, token }) => {
      const html = await render(
        React.createElement(ResetPasswordEmail, {
          userName: user.name ?? user.email,
          resetUrl: url
        })
      );
      await publishEmailJob({
        type: "reset",
        to: user.email,
        subject: "Reset your password",
        html,
        token
      });
    }
  },

  emailVerification: {
    enabled: true,
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user, url }) => {
      const html = await render(
        React.createElement(VerifyEmail, {
          name: user.name ?? user.email,
          verifyUrl: url
        })
      );
      await publishEmailJob({
        type: "verification",
        to: user.email,
        subject: "Verify your email",
        html
      });
    },
    autoSignInAfterVerification: true,
    async afterEmailVerification(user) {
      logger.info(`${user.email} successfully verified!`);
    }
  },

  socialProviders: {
    google: {
      prompt: "select_account",
      clientId: env.GOOGLE_CLIENT_ID ?? process.env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET ?? process.env.GOOGLE_CLIENT_SECRET
    }
  },

  plugins: [openAPI()],

  hooks: {
    after: createAuthMiddleware(async (ctx) => {
      if (ctx.path === "/sign-up/email") {
        const newUser = ctx.context.newSession?.user;
        if (newUser) {
          const profileCreator = (prisma as unknown as Record<string, unknown>)
            .profile as
            | {
                create?: (args: {
                  data: { userId: string };
                }) => Promise<unknown>;
              }
            | undefined;
          await profileCreator
            ?.create?.({ data: { userId: newUser.id } })
            .catch(() => {});
        }
      }
    })
  },

  advanced: {
    useSecureCookies: env.NODE_ENV === "production",
    defaultCookieAttributes: {
      secure: env.NODE_ENV === "production",
      sameSite: env.NODE_ENV === "production" ? "none" : "lax",
      path: "/"
    }
  },

  cookie: {
    secure: env.NODE_ENV === "production",
    sameSite: env.NODE_ENV === "production" ? "none" : "lax",
    httpOnly: true,
    path: "/"
  }
});
