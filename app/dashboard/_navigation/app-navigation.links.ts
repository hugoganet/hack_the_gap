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
    titleKey: "groups.menu",
    links: [
      {
        href: "/dashboard",
        Icon: Home,
        label: "Learn",
        labelKey: "links.learn",
      },
      {
        href: "/dashboard/courses",
        Icon: BookOpen,
        label: "Courses",
        labelKey: "links.courses",
      },
    ],
  },
] satisfies NavigationGroup[];
