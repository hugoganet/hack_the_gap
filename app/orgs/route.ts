import { getUser } from "@/lib/auth/auth-user";
import { getServerUrl } from "@/lib/server-url";
import { NextResponse } from "next/server";

/**
 * Redirect /orgs to /dashboard (organizations removed)
 */
export const GET = async () => {
  const user = await getUser();

  if (!user) {
    return NextResponse.redirect(`${getServerUrl()}/auth/signin`);
  }

  return NextResponse.redirect(`${getServerUrl()}/dashboard`);
};
