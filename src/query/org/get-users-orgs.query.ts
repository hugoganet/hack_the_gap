import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import type { AuthOrganization } from "@/lib/auth/auth-type";

/**
 * Organizations have been deprecated in the app.
 * This function now safely returns an empty list to avoid runtime errors.
 * If listOrganizations exists (e.g., in legacy environments), it will be used.
 */
export async function getUsersOrgs(): Promise<AuthOrganization[]> {
  try {
    const api: unknown = (auth as unknown as { api?: unknown }).api;
    if (
      api &&
      typeof (api as Record<string, unknown>).listOrganizations === "function"
    ) {
      const userOrganizations = await (api as {
        listOrganizations: (args: { headers: Headers }) => Promise<AuthOrganization[]>;
      }).listOrganizations({
        headers: await headers(),
      });
      return userOrganizations;
    }
  } catch {
    // noop - fall through to return []
  }
  return [];
}
