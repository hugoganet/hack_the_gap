import type { NavigationGroup } from "@/features/navigation/navigation.type";
import {
  BookOpen,
  Home,
  Settings,
  User,
} from "lucide-react";

export const getAppNavigation = (): NavigationGroup[] => {
  return APP_LINKS;
};

export const APP_LINKS: NavigationGroup[] = [
  {
    title: "Menu",
    links: [
      {
        href: "/dashboard",
        Icon: Home,
        label: "Dashboard",
      },
      {
        href: "/dashboard/users",
        Icon: User,
        label: "My Learning",
      },
      {
        href: "/dashboard/courses",
        Icon: BookOpen,
        label: "Courses",
      },
    ],
  },
  {
    title: "Account",
    defaultOpenStartPath: "/dashboard/settings",
    links: [
      {
        href: "/dashboard/settings",
        Icon: Settings,
        label: "Settings",
      },
    ],
  },
] satisfies NavigationGroup[];
