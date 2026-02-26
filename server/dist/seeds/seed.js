"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const crypto_1 = require("crypto");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const logger_1 = require("../config/logger");
const prisma = new client_1.PrismaClient();
async function main() {
    logger_1.logger.info("Seeding database...");
    /* ============================================================
       1. Seed Users
    ============================================================ */
    const passwordHash = await bcryptjs_1.default.hash("Password123!", 10);
    const users = [
        {
            id: (0, crypto_1.randomUUID)(),
            name: "Admin User",
            email: "admin@example.com",
            emailVerified: true
        },
        {
            id: (0, crypto_1.randomUUID)(),
            name: "Test User",
            email: "test@example.com",
            emailVerified: true
        },
        {
            id: (0, crypto_1.randomUUID)(),
            name: "Demo User",
            email: "demo@example.com",
            emailVerified: false
        }
    ];
    for (const user of users) {
        await prisma.user.upsert({
            where: { email: user.email },
            update: {},
            create: {
                ...user,
                accounts: {
                    create: {
                        id: (0, crypto_1.randomUUID)(),
                        providerId: "credentials",
                        accountId: user.email,
                        password: passwordHash
                    }
                }
            }
        });
    }
    logger_1.logger.info("Users seeded successfully");
    /* ============================================================
       2. Fetch Seeded Users
    ============================================================ */
    const seededUsers = await prisma.user.findMany();
    /* ============================================================
       3. Seed Categories + Expenses (2 each per user)
    ============================================================ */
    for (const user of seededUsers) {
        logger_1.logger.info(`Seeding categories + expenses for ${user.email}`);
        /* -------------------------------
           Categories (2 dummy)
        -------------------------------- */
        const foodCategory = await prisma.category.upsert({
            where: {
                name_userId: {
                    name: "Food",
                    userId: user.id
                }
            },
            update: {},
            create: {
                name: "Food",
                userId: user.id
            }
        });
        const transportCategory = await prisma.category.upsert({
            where: {
                name_userId: {
                    name: "Transport",
                    userId: user.id
                }
            },
            update: {},
            create: {
                name: "Transport",
                userId: user.id
            }
        });
        /* -------------------------------
           Expenses (2 dummy)
        -------------------------------- */
        await prisma.expense.createMany({
            data: [
                {
                    amount: 250,
                    merchant: "Pizza Hut",
                    date: new Date(),
                    userId: user.id,
                    categoryId: foodCategory.id
                },
                {
                    amount: 80,
                    merchant: "Uber Ride",
                    date: new Date(),
                    userId: user.id,
                    categoryId: transportCategory.id
                }
            ]
        });
    }
    logger_1.logger.info("Categories + Expenses seeded successfully");
    logger_1.logger.info("Seed completed!");
}
main()
    .catch((e) => {
    logger_1.logger.error("Seed failed", e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
