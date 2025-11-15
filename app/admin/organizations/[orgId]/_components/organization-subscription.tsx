"use client";

import { Typography } from "@/components/nowts/typography";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Organization, Subscription } from "@/generated/prisma";
import { format } from "date-fns";

type OrganizationWithSubscription = Organization & {
  subscription: Subscription | null;
};

// Subscription/billing management removed for hackathon
export function OrganizationSubscription({
  organization,
}: {
  organization: OrganizationWithSubscription;
  subscription: Subscription | null;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Organization Plan</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <Typography variant="h3">Current Plan</Typography>
          <div className="flex items-center gap-4">
            <Typography variant="large">Free Plan</Typography>
            <Badge variant="default">Active</Badge>
          </div>
          <Typography variant="muted">
            All features available for hackathon version
          </Typography>
          <Typography variant="muted">
            Organization created:{" "}
            {format(organization.createdAt, "MMM dd, yyyy")}
          </Typography>
        </div>
      </CardContent>
    </Card>
  );
}
