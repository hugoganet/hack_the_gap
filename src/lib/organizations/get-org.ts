import { headers } from "next/headers";
import { unauthorized } from "next/navigation";
import { auth } from "../auth";
import type { AuthPermission, AuthRole } from "../auth/auth-permissions";
import { getSession } from "../auth/auth-user";
import { prisma } from "../prisma";
import { isInRoles } from "./is-in-roles";

type OrgParams = {
  roles?: AuthRole[];
  permissions?: AuthPermission;
};

const getOrg = async () => {
  const user = await getSession();

  if (user?.session.activeOrganizationId) {
    // Get organization directly from Prisma to include stripeCustomerId
    return prisma.organization.findFirst({
      where: { id: user.session.activeOrganizationId },
      include: {
        members: {
          include: {
            user: true,
          },
        },
        invitations: true,
      },
    });
  }

  return null;
};

export const getCurrentOrg = async (params?: OrgParams) => {
  const user = await getSession();

  if (!user) {
    return null;
  }

  const org = await getOrg();

  if (!org) {
    return null;
  }

  const memberRoles = org.members
    .filter((member) => member.userId === user.session.userId)
    .map((member) => member.role) as AuthRole[];

  if (memberRoles.length === 0 || !isInRoles(memberRoles, params?.roles)) {
    return null;
  }

  if (params?.permissions) {
    const hasPermission = await auth.api.hasPermission({
      headers: await headers(),
      body: {
        permission: params.permissions,
      },
    });

    if (!hasPermission.success) {
      return null;
    }
  }

  // Subscription removed - not needed for hackathon

  const OWNER = org.members.find((m) => m.role === "owner");

  return {
    ...org,
    slug: org.slug ?? "org-slug-default",
    user: user.user,
    email: (OWNER?.user.email ?? null) as string | null,
    memberRoles: memberRoles,
    subscription: null, // Always null - subscriptions removed
  };
};

export type CurrentOrgPayload = NonNullable<
  Awaited<ReturnType<typeof getCurrentOrg>>
>;

export const getRequiredCurrentOrg = async (params?: OrgParams) => {
  const result = await getCurrentOrg(params);

  if (!result) {
    unauthorized();
  }

  return result;
};
