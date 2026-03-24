import { PlanType, SubscriptionStatus, UserRole, PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { SUBSCRIPTION_CONFIG } from "../src/lib/constants";

const prisma = new PrismaClient();

async function main() {
  const charities = [
    {
      name: "Junior Fairway Foundation",
      slug: "junior-fairway-foundation",
      description:
        "Supports golf access for underrepresented youth through coaching and course-day sponsorships.",
      isFeatured: true,
      isActive: true,
    },
    {
      name: "Greens For Recovery",
      slug: "greens-for-recovery",
      description:
        "Funds rehabilitation and mental wellness programs through sport-led community events.",
      isFeatured: false,
      isActive: true,
    },
    {
      name: "Community Birdie Trust",
      slug: "community-birdie-trust",
      description:
        "Delivers local grant support for families facing medical and educational hardship.",
      isFeatured: false,
      isActive: true,
    },
  ];

  for (const charity of charities) {
    await prisma.charity.upsert({
      where: { slug: charity.slug },
      update: charity,
      create: charity,
    });
  }

  const adminEmail = "admin@fairwayforgood.test";
  const userEmail = "player@fairwayforgood.test";
  const adminHash = await bcrypt.hash("Admin@12345", 12);
  const userHash = await bcrypt.hash("Player@12345", 12);
  const firstCharity = await prisma.charity.findFirst({
    where: { isActive: true },
    orderBy: { createdAt: "asc" },
  });

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      fullName: "Platform Admin",
      passwordHash: adminHash,
      role: UserRole.ADMIN,
    },
    create: {
      fullName: "Platform Admin",
      email: adminEmail,
      passwordHash: adminHash,
      role: UserRole.ADMIN,
    },
  });

  const player = await prisma.user.upsert({
    where: { email: userEmail },
    update: {
      fullName: "Demo Subscriber",
      passwordHash: userHash,
    },
    create: {
      fullName: "Demo Subscriber",
      email: userEmail,
      passwordHash: userHash,
      role: UserRole.SUBSCRIBER,
    },
  });

  if (firstCharity) {
    await prisma.charityPreference.upsert({
      where: { userId: player.id },
      update: {
        charityId: firstCharity.id,
        contributionPercent: SUBSCRIPTION_CONFIG.defaultCharityPercent,
      },
      create: {
        userId: player.id,
        charityId: firstCharity.id,
        contributionPercent: SUBSCRIPTION_CONFIG.defaultCharityPercent,
      },
    });
  }

  const activeSubscription = await prisma.subscription.findFirst({
    where: {
      userId: player.id,
      status: SubscriptionStatus.ACTIVE,
    },
  });

  if (!activeSubscription) {
    await prisma.subscription.create({
      data: {
        userId: player.id,
        plan: PlanType.MONTHLY,
        status: SubscriptionStatus.ACTIVE,
        amount: SUBSCRIPTION_CONFIG.monthlyPrice,
        charityPercent: SUBSCRIPTION_CONFIG.defaultCharityPercent,
        renewalDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
        provider: "seed",
        providerRef: `seed-${Date.now()}`,
      },
    });
  }

  const scoreCount = await prisma.scoreEntry.count({
    where: { userId: player.id },
  });

  if (scoreCount === 0) {
    const today = new Date();
    const scores = [21, 29, 34, 18, 40];
    await Promise.all(
      scores.map((score, idx) =>
        prisma.scoreEntry.create({
          data: {
            userId: player.id,
            score,
            playedOn: new Date(today.getTime() - idx * 1000 * 60 * 60 * 24 * 7),
          },
        }),
      ),
    );
  }

  console.log("Seed complete.");
  console.log("Admin:", admin.email, "Password: Admin@12345");
  console.log("User:", player.email, "Password: Player@12345");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
