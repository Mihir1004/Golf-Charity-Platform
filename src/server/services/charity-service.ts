import { DonationType } from "@prisma/client";
import {
  isDatabaseConnectivityError,
  isPlaceholderDatabaseUrl,
} from "@/lib/prisma-errors";
import { prisma } from "@/lib/prisma";
import { SUBSCRIPTION_CONFIG } from "@/lib/constants";

export async function listActiveCharities() {
  if (isPlaceholderDatabaseUrl()) {
    return [];
  }

  try {
    return await prisma.charity.findMany({
      where: { isActive: true },
      orderBy: [{ isFeatured: "desc" }, { name: "asc" }],
    });
  } catch (error) {
    if (isDatabaseConnectivityError(error)) {
      return [];
    }
    throw error;
  }
}

export async function listAllCharities() {
  return prisma.charity.findMany({
    orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
  });
}

export async function getFeaturedCharity() {
  if (isPlaceholderDatabaseUrl()) {
    return null;
  }

  try {
    return await prisma.charity.findFirst({
      where: { isActive: true, isFeatured: true },
      orderBy: { updatedAt: "desc" },
    });
  } catch (error) {
    if (isDatabaseConnectivityError(error)) {
      return null;
    }
    throw error;
  }
}

export async function setUserCharityPreference(
  userId: string,
  charityId: string,
  contributionPercent: number,
): Promise<void> {
  const selectedCharity = await prisma.charity.findFirst({
    where: { id: charityId, isActive: true },
    select: { id: true },
  });

  if (!selectedCharity) {
    throw new Error("Selected charity is not available.");
  }

  if (contributionPercent < SUBSCRIPTION_CONFIG.minimumCharityPercent) {
    throw new Error(
      `Minimum contribution is ${SUBSCRIPTION_CONFIG.minimumCharityPercent}%.`,
    );
  }

  await prisma.charityPreference.upsert({
    where: { userId },
    update: {
      charityId,
      contributionPercent,
    },
    create: {
      userId,
      charityId,
      contributionPercent,
    },
  });
}

export async function addIndependentDonation(
  userId: string,
  charityId: string,
  amount: number,
): Promise<void> {
  if (amount <= 0) {
    throw new Error("Donation must be greater than zero.");
  }
  const selectedCharity = await prisma.charity.findFirst({
    where: { id: charityId, isActive: true },
    select: { id: true },
  });
  if (!selectedCharity) {
    throw new Error("Selected charity is not available.");
  }

  await prisma.donation.create({
    data: {
      userId,
      charityId,
      amount,
      type: DonationType.INDEPENDENT,
    },
  });
}

export async function getUserCharityPreference(userId: string) {
  return prisma.charityPreference.findUnique({
    where: { userId },
    include: { charity: true },
  });
}

export async function upsertCharity(input: {
  id?: string;
  name: string;
  slug: string;
  description: string;
  imageUrl?: string | null;
  upcomingEvents?: string | null;
  isFeatured?: boolean;
  isActive?: boolean;
}): Promise<void> {
  const normalized = {
    id: input.id?.trim(),
    name: input.name.trim(),
    slug: input.slug.trim().toLowerCase(),
    description: input.description.trim(),
    imageUrl: input.imageUrl?.trim() || null,
    upcomingEvents: input.upcomingEvents?.trim() || null,
    isFeatured: input.isFeatured ?? false,
    isActive: input.isActive ?? true,
  };

  if (!normalized.name || !normalized.slug || !normalized.description) {
    throw new Error("Name, slug, and description are required.");
  }

  if (normalized.id) {
    await prisma.charity.update({
      where: { id: normalized.id },
      data: {
        name: normalized.name,
        slug: normalized.slug,
        description: normalized.description,
        imageUrl: normalized.imageUrl,
        upcomingEvents: normalized.upcomingEvents
          ? { notes: normalized.upcomingEvents }
          : undefined,
        isFeatured: normalized.isFeatured,
        isActive: normalized.isActive,
      },
    });
    return;
  }

  await prisma.charity.create({
    data: {
      name: normalized.name,
      slug: normalized.slug,
      description: normalized.description,
      imageUrl: normalized.imageUrl,
      upcomingEvents: normalized.upcomingEvents ? { notes: normalized.upcomingEvents } : undefined,
      isFeatured: normalized.isFeatured,
      isActive: normalized.isActive,
    },
  });
}

export async function deleteCharity(id: string): Promise<void> {
  await prisma.charity.update({
    where: { id },
    data: {
      isActive: false,
      isFeatured: false,
    },
  });
}

export async function getCharityContributionTotals() {
  const grouped = await prisma.donation.groupBy({
    by: ["charityId"],
    _sum: { amount: true },
  });

  const charityIds = grouped.map((entry) => entry.charityId);
  const charities = await prisma.charity.findMany({
    where: { id: { in: charityIds } },
  });
  const charityMap = new Map(charities.map((entry) => [entry.id, entry.name]));

  return grouped
    .map((entry) => ({
      charityId: entry.charityId,
      charityName: charityMap.get(entry.charityId) ?? "Unknown",
      total: Number(entry._sum.amount ?? 0),
    }))
    .sort((a, b) => b.total - a.total);
}
