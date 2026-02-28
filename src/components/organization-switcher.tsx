"use client"

import { useState } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Check, ChevronsUpDown, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { CreateOrganizationDialog } from "./create-organization-dialog"

export function OrganizationSwitcher() {
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

  if (userOrgs === undefined) {
    return (
      <Button variant="outline" className="w-full justify-between" disabled>
        <span className="truncate">Loading...</span>
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>
    )
  }

  const organizations = userOrgs || []
  const currentOrgName = currentOrg?.name || "No Organization"

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-full justify-between">
            <span className="truncate">{currentOrgName}</span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[200px]" align="start">
          <DropdownMenuLabel>Organizations</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {organizations.length === 0 ? (
            <DropdownMenuItem disabled>
              No organizations
            </DropdownMenuItem>
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

      <CreateOrganizationDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />
    </>
  )
}
