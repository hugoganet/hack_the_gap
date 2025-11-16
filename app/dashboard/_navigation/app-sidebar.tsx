"use client";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { SidebarNavigationMenu } from "@/components/ui/sidebar-utils";
import { ContactFeedbackPopover } from "@/features/contact/feedback/contact-feedback-popover";
import type { NavigationGroup } from "@/features/navigation/navigation.type";
import { SidebarUserButton } from "@/features/sidebar/sidebar-user-button";
import { ChevronDown } from "lucide-react";
import { usePathname } from "next/navigation";
import type { PropsWithChildren } from "react";
import { useEffect, useState } from "react";
import { getAppNavigation } from "./app-navigation.links";

export function AppSidebar() {
  const links: NavigationGroup[] = getAppNavigation();

  return (
    <Sidebar variant="inset">
      <SidebarHeader className="flex flex-col gap-2">
        <div className="flex items-center gap-2 px-2 py-1.5">
          <h2 className="text-lg font-semibold">Hack the Gap</h2>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {links.map((link) => (
          <ItemCollapsing
            defaultOpenStartPath={link.defaultOpenStartPath}
            key={link.title}
          >
            <SidebarGroup key={link.title}>
              <SidebarGroupLabel asChild>
                <CollapsibleTrigger>
                  {link.title}
                  <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                </CollapsibleTrigger>
              </SidebarGroupLabel>
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarNavigationMenu link={link} />
                </SidebarGroupContent>
              </CollapsibleContent>
            </SidebarGroup>
          </ItemCollapsing>
        ))}
      </SidebarContent>
      <SidebarFooter className="flex flex-col gap-2">
        <ContactFeedbackPopover />
        <SidebarUserButton />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

const ItemCollapsing = (
  props: PropsWithChildren<{ defaultOpenStartPath?: string }>,
) => {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const isOpen = props.defaultOpenStartPath
    ? pathname.startsWith(props.defaultOpenStartPath)
    : true;

  useEffect(() => {
    if (isOpen) {
      setOpen(isOpen);
    }
  }, [isOpen]);
  
  return (
    <Collapsible
      defaultOpen={isOpen}
      onOpenChange={setOpen}
      open={open}
      className="group/collapsible"
    >
      {props.children}
    </Collapsible>
  );
};
