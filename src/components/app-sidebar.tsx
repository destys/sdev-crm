"use client";

import * as React from "react";
import {
  LayoutDashboard,
  Users,
  MessagesSquare,
  Briefcase,
  Phone,
  Wallet,
  Bot,
  Settings2,
  LifeBuoy,
  Send,
  PlusCircleIcon,
} from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";

import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Link } from "@/i18n/navigation";
import { useDialogStore } from "@/store/use-dialog-store";

import { AddClientModal } from "./modals/add-client-modal";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const t = useTranslations("sidebar");
  const { openDialog } = useDialogStore();
  const data = {
    user: {
      name: "Some Dev",
      email: "support@some-dev.com",
      avatar: "/avatars/user.png",
    },
    navMain: [
      {
        title: t("dashboard.title"),
        url: "/",
        icon: LayoutDashboard,
      },
      {
        title: t("clients.title"),
        url: "/clients",
        icon: Users,
        items: [
          {
            title: t("clients.new"),
            icon: PlusCircleIcon,
            onClick: () =>
              openDialog({
                content: <AddClientModal />,
              }),
          },
          { title: t("clients.list"), url: "/clients" },
        ],
      },
      {
        title: t("leads.title"),
        url: "/leads",
        icon: MessagesSquare,
      },
      {
        title: t("projects.title"),
        url: "/projects",
        icon: Briefcase,
      },
      {
        title: t("calls.title"),
        url: "/calls",
        icon: Phone,
      },
      {
        title: t("finance.title"),
        url: "/finance",
        icon: Wallet,
        items: [
          { title: t("finance.income"), url: "/finance/income" },
          { title: t("finance.expenses"), url: "/finance/expenses" },
          { title: t("finance.reports"), url: "/finance/reports" },
        ],
      },
      {
        title: t("assistant.title"),
        url: "/assistant",
        icon: Bot,
      },
      {
        title: t("settings.title"),
        url: "/settings",
        icon: Settings2,
        items: [
          { title: t("settings.profile"), url: "/settings/profile" },
          { title: t("settings.billing"), url: "/settings/billing" },
          {
            title: t("settings.notifications"),
            url: "/settings/notifications",
          },
        ],
      },
    ],
    navSecondary: [
      {
        title: t("support.title"),
        url: "/support",
        icon: LifeBuoy,
      },
      {
        title: t("feedback.title"),
        url: "/feedback",
        icon: Send,
      },
    ],
  };

  return (
    <Sidebar
      className="top-(--header-height) h-[calc(100svh-var(--header-height))]!"
      {...props}
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg p-1">
                  <Image
                    src={"/small-logo.svg"}
                    alt="SomeDev Logo"
                    width={48}
                    height={48}
                  />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Some-Dev</span>
                  <span className="truncate text-xs">CRM</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>

      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
