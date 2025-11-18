import type { LayoutParams, PageParams } from "@/types/next";
import type { Metadata } from "next";

/**
 * Organizations feature removed.
 * Keep minimal layout without org logic.
 */
export async function generateMetadata(
  _props: PageParams<{ orgSlug: string }>,
): Promise<Metadata> {
  return { title: "Organizations unavailable" };
}

export default async function RouteLayout(
  props: LayoutParams<{ orgSlug: string }>,
) {
  return props.children;
}
