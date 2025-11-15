import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TypographyH1, TypographyP } from "@/components/ui/typography";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function BetaInvitationsPage() {
  const invitations = await prisma.betaInvitation.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  const stats = {
    total: invitations.length,
    pending: invitations.filter((i) => i.status === "pending").length,
    invited: invitations.filter((i) => i.status === "invited").length,
    registered: invitations.filter((i) => i.status === "registered").length,
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <TypographyH1>Beta Invitations</TypographyH1>
        <TypographyP className="text-muted-foreground mt-2">
          Manage and track beta invitation requests
        </TypographyP>
      </div>

      {/* Stats Cards */}
      <div className="mb-8 grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Requests</CardDescription>
            <CardTitle className="text-3xl">{stats.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Pending</CardDescription>
            <CardTitle className="text-3xl text-yellow-600">{stats.pending}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Invited</CardDescription>
            <CardTitle className="text-3xl text-blue-600">{stats.invited}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Registered</CardDescription>
            <CardTitle className="text-3xl text-green-600">{stats.registered}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Invitations Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Invitations</CardTitle>
          <CardDescription>
            List of all beta invitation requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          {invitations.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              No beta invitations yet
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Requested At</TableHead>
                  <TableHead>Updated At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invitations.map((invitation) => (
                  <TableRow key={invitation.id}>
                    <TableCell className="font-medium">{invitation.email}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          invitation.status === "registered"
                            ? "default"
                            : invitation.status === "invited"
                            ? "secondary"
                            : "outline"
                        }
                      >
                        {invitation.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(invitation.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </TableCell>
                    <TableCell>
                      {new Date(invitation.updatedAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
