import type { ReactNode } from "react";
import { AppNavigation } from "./_navigation/app-navigation";

export default async function RouteLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <AppNavigation>{children}</AppNavigation>;
}
