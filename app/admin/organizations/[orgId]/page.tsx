import { Button } from "@/components/ui/button";
import {
  Layout,
  LayoutContent,
  LayoutDescription,
  LayoutHeader,
  LayoutTitle,
} from "@/features/page/layout";
import { getRequiredAdmin } from "@/lib/auth/auth-user";
import { prisma } from "@/lib/prisma";
import type { PageParams } from "@/types/next";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { OrganizationMembers } from "./_components/organization-members";

export default async function OrganizationDetailPage(
  props: PageParams<{ orgId: string }>,
) {
  await getRequiredAdmin();
  const params = await props.params;

  const organization = await prisma.organization.findUnique({
    where: {
      id: params.orgId,
    },
    include: {
      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
      },
    },
  });

  if (!organization) {
    notFound();
  }

  return (
    <Layout size="lg">
      <LayoutHeader>
        <div className="flex items-center gap-2">
          <Link href="/admin/organizations">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Organizations
            </Button>
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <LayoutTitle>{organization.name}</LayoutTitle>
        </div>
        <LayoutDescription>
          Manage {organization.name}'s members
        </LayoutDescription>
      </LayoutHeader>

      <LayoutContent>
        <div className="space-y-6">
          <OrganizationMembers members={organization.members} />
        </div>
      </LayoutContent>
    </Layout>
  );
}
