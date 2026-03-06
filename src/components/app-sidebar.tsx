"use client"

import * as React from "react"
import { useState } from "react"
import {
  LayoutDashboard,
  Settings,
  Check,
  ChevronsUpDown,
  Plus,
} from "lucide-react"
import Link from "next/link"
import { Logo } from "@/components/logo"
import { SidebarNotification } from "@/components/sidebar-notification"
import { NotificationsPopover } from "@/components/notifications-popover"
import { siteConfig } from "@/config/site"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { CreateOrganizationDialog } from "./create-organization-dialog"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const data = {
  navGroups: [
    {
      label: "Dashboards",
      items: [
        {
          title: "Dashboard",
          url: "/dashboard",
          icon: LayoutDashboard,
        },
      ],
    },
    {
      label: "Settings",
      items: [
        {
          title: "Settings",
          url: "#",
          icon: Settings,
          items: [
            {
              title: "User Settings",
              url: "/settings/user",
            },
            {
              title: "Account Settings",
              url: "/settings/account",
            },
            {
              title: "Plans & Billing",
              url: "/settings/billing",
            },
            {
              title: "Appearance",
              url: "/settings/appearance",
            },
            {
              title: "Notifications",
              url: "/settings/notifications",
            },
            {
              title: "Connections",
              url: "/settings/connections",
            },
            {
              title: "Organization",
              url: "/settings/organization",
            },
          ],
        },
      ],
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [createDialogOpen, setCreateDialogOpen] = useState(false)

  const currentOrg = useQuery(api.features.organization.organization.getCurrentOrganization)
  const userOrgs = useQuery(api.features.organization.organization.listUserOrganizations)
  const setActiveOrg = useMutation(api.features.organization.mutations.setActiveOrganization)

  const handleSwitchOrganization = async (organizationId: string) => {
    try {
      await setActiveOrg({ organizationId })
    } catch (error) {
      console.error("Failed to switch organization:", error)
    }
  }

  const organizations = userOrgs || []
  const currentOrgName = currentOrg?.name ?? siteConfig.name

  return (
    <>
      <Sidebar {...props}>
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton size="lg">
                    <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                      <Logo size={24} className="text-current" />
                    </div>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-medium">{currentOrgName}</span>
                      <span className="truncate text-xs">Admin Dashboard</span>
                    </div>
                    <ChevronsUpDown className="ml-auto size-4 shrink-0 opacity-50" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                  align="start"
                  side="bottom"
                  sideOffset={4}
                >
                  <DropdownMenuLabel>Organizations</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {organizations.length === 0 ? (
                    <DropdownMenuItem disabled>No organizations</DropdownMenuItem>
                  ) : (
                    organizations.map((org) => (
                      <DropdownMenuItem
                        key={org.id}
                        onClick={() => handleSwitchOrganization(org.id)}
                        className="cursor-pointer"
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            currentOrg?.id === org.id ? "opacity-100" : "opacity-0"
                          )}
                        />
                        <span className="truncate">{org.name}</span>
                      </DropdownMenuItem>
                    ))
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setCreateDialogOpen(true)}
                    className="cursor-pointer"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create Organization
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <NotificationsPopover />
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          {data.navGroups.map((group) => (
            <NavMain key={group.label} label={group.label} items={group.items} />
          ))}
        </SidebarContent>
        <SidebarFooter>
          <SidebarNotification />
          <NavUser />
        </SidebarFooter>
      </Sidebar>

      <CreateOrganizationDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />
    </>
  )
}
