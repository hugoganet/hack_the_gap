"use client";

import { Typography } from "@/components/nowts/typography";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSession } from "@/lib/auth-client";
import {
  LayoutDashboard,
  Monitor,
  Moon,
  Settings,
  Shield,
  SunMedium,
  SunMoon,
  Languages,
} from "lucide-react";

import { useTheme } from "next-themes";
import { useLocale, useTranslations } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import type { PropsWithChildren } from "react";
import { UserDropdownLogout } from "./user-dropdown-logout";
import { UserDropdownStopImpersonating } from "./user-dropdown-stop-impersonating";

export const UserDropdown = ({ children }: PropsWithChildren) => {
  const session = useSession();
  const theme = useTheme();
  const t = useTranslations("settings");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const changeLanguage = (newLocale: string) => {
    // Remove current locale from pathname if it exists
    const pathWithoutLocale = pathname.replace(/^\/(en|fr)(?=\/|$)/, "");
    const search = typeof window !== "undefined" ? window.location.search : "";

    // Persist chosen locale for middleware/next-intl
    if (typeof document !== "undefined") {
      document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`;
    }

    // Navigate and refresh to ensure server components re-render in new locale
    router.replace(`/${newLocale}${pathWithoutLocale}${search}`);
    router.refresh();
  };

  if (!session.data?.user) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>
          {session.data.user.name ? (
            <>
              <Typography variant="small">
                {session.data.user.name || session.data.user.email}
              </Typography>
              <Typography variant="muted">{session.data.user.email}</Typography>
            </>
          ) : (
            <Typography variant="small">{session.data.user.email}</Typography>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/orgs">
            <LayoutDashboard className="mr-2 size-4" />
            Dashboard
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/account">
            <Settings className="mr-2 size-4" />
            Account Settings
          </Link>
        </DropdownMenuItem>
        {session.data.user.role === "admin" && (
          <DropdownMenuItem asChild>
            <Link href="/admin">
              <Shield className="mr-2 size-4" />
              Admin
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <SunMoon className="text-muted-foreground mr-4 size-4" />
            <span>{t("theme.label")}</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              <DropdownMenuItem onClick={() => theme.setTheme("dark")}>
                <SunMedium className="mr-2 size-4" />
                <span>{t("theme.dark")}</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => theme.setTheme("light")}>
                <Moon className="mr-2 size-4" />
                <span>{t("theme.light")}</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => theme.setTheme("system")}>
                <Monitor className="mr-2 size-4" />
                <span>{t("theme.system")}</span>
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>

        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Languages className="text-muted-foreground mr-4 size-4" />
            <span>{t("language.label")}</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              <DropdownMenuItem onClick={() => changeLanguage("en")}>
                <span className="mr-2">🇬🇧</span>
                <span>{t("language.en")}</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => changeLanguage("fr")}>
                <span className="mr-2">🇫🇷</span>
                <span>{t("language.fr")}</span>
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <UserDropdownLogout />
          {session.data.session.impersonatedBy ? (
            <UserDropdownStopImpersonating />
          ) : null}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
