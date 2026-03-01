"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auth = void 0;
const better_auth_1 = require("better-auth");
const prisma_1 = require("better-auth/adapters/prisma");
const api_1 = require("better-auth/api");
const plugins_1 = require("better-auth/plugins");
const qstash_1 = require("../../jobs/qstash");
const environments_1 = require("../../config/environments");
const prisma_2 = require("../../lib/prisma");
const authBaseURL = (environments_1.env.BETTER_AUTH_BASE_URL || "http://localhost:4000/api/auth").replace(/\/$/, "");
const googleClientId = environments_1.env.GOOGLE_CLIENT_ID_BAUTH || environments_1.env.GOOGLE_CLIENT_ID;
const googleClientSecret = environments_1.env.GOOGLE_CLIENT_SECRET_BAUTH || environments_1.env.GOOGLE_CLIENT_SECRET;
exports.auth = (0, better_auth_1.betterAuth)({
    database: (0, prisma_1.prismaAdapter)(prisma_2.prisma, {
        provider: "postgresql"
    }),
    trustedOrigins: [
        environments_1.env.CLIENT_URL ?? process.env.CLIENT_URL,
        "http://localhost:5173",
        "http://localhost:3000",
        "http://localhost:4000"
    ].filter(Boolean),
    baseURL: authBaseURL,
    emailAndPassword: {
        enabled: true,
        sendResetPassword: async ({ user, url, token }) => {
            const html = `
        <p>Hi ${user.name ?? user.email},</p>
        <p>We received a request to reset your password. Click the link below to set a new password:</p>
        <a href="${url}" style="display:inline-block;padding:10px 20px;background:#1a73e8;color:#fff;text-decoration:none;border-radius:4px;">
          Reset Password
        </a>
        <p>If you did not request a password reset, you can ignore this email.</p>
      `;
            await (0, qstash_1.publishEmailJob)({
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
            const html = `
        <p>Hello ${user.name ?? user.email},</p>
        <p>Please verify your email by clicking the link below:</p>
        <a href="${url}" style="display:inline-block;padding:10px 20px;background:#1a73e8;color:#fff;text-decoration:none;border-radius:4px;">
          Verify Email
        </a>
      `;
            await (0, qstash_1.publishEmailJob)({
                type: "verification",
                to: user.email,
                subject: "Verify your email",
                html
            });
        },
        autoSignInAfterVerification: true,
        async afterEmailVerification(user) {
            better_auth_1.logger.info(`${user.email} successfully verified!`);
        }
    },
    socialProviders: {
        google: {
            prompt: "select_account",
            clientId: googleClientId,
            clientSecret: googleClientSecret
        }
    },
    plugins: [(0, plugins_1.openAPI)()],
    hooks: {
        after: (0, api_1.createAuthMiddleware)(async (ctx) => {
            if (ctx.path === "/sign-up/email") {
                const newUser = ctx.context.newSession?.user;
                if (newUser) {
                    const profileCreator = prisma_2.prisma
                        .profile;
                    await profileCreator
                        ?.create?.({ data: { userId: newUser.id } })
                        .catch(() => { });
                }
            }
        })
    },
    advanced: {
        useSecureCookies: environments_1.env.NODE_ENV === "production",
        defaultCookieAttributes: {
            secure: environments_1.env.NODE_ENV === "production",
            sameSite: environments_1.env.NODE_ENV === "production" ? "none" : "lax",
            path: "/"
        }
    },
    cookie: {
        secure: environments_1.env.NODE_ENV === "production",
        sameSite: environments_1.env.NODE_ENV === "production" ? "none" : "lax",
        httpOnly: true,
        path: "/"
    }
});
