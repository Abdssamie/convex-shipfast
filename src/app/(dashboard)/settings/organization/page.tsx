"use client"

import { useState } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { UserPlus, UserMinus, LogOut, Trash2 } from "lucide-react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"

const inviteSchema = z.object({
  email: z.string().email("Invalid email address"),
})

type InviteFormValues = z.infer<typeof inviteSchema>

export default function OrganizationSettingsPage() {
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false)
  const [removeMemberId, setRemoveMemberId] = useState<string | null>(null)

  const currentOrg = useQuery(api.features.organization.organization.getCurrentOrganization)
  const inviteMember = useMutation(api.features.organization.mutations.inviteMember)
  const removeMember = useMutation(api.features.organization.mutations.removeMember)
  const leaveOrganization = useMutation(api.features.organization.mutations.leaveOrganization)

  const form = useForm<InviteFormValues>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      email: "",
    },
  })

  const handleInviteMember = async (data: InviteFormValues) => {
    try {
      await inviteMember({
        email: data.email.trim().toLowerCase(),
        role: "member",
      })
      toast.success("Invitation sent successfully")
      form.reset()
      setInviteDialogOpen(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to send invitation")
    }
  }

  const handleRemoveMember = async (memberEmail: string) => {
    try {
      await removeMember({ memberIdOrEmail: memberEmail })
      toast.success("Member removed successfully")
      setRemoveMemberId(null)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to remove member")
    }
  }

  const handleLeaveOrganization = async () => {
    try {
      await leaveOrganization({})
      toast.success("You have left the organization")
      setLeaveDialogOpen(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to leave organization")
    }
  }

  if (currentOrg === undefined) {
    return (
      <div className="px-4 lg:px-6 flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Loading organization...</p>
      </div>
    )
  }

  if (!currentOrg) {
    return (
      <div className="px-4 lg:px-6">
        <Card>
          <CardHeader>
            <CardTitle>No Organization</CardTitle>
            <CardDescription>You are not currently a member of any organization</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  const members = currentOrg.members || []
  const isOwner = members.some(m => m.role === "owner")

  return (
    <div className="px-4 lg:px-6 space-y-6">
      {/* Organization Details */}
      <Card>
        <CardHeader>
          <CardTitle>Organization Details</CardTitle>
          <CardDescription>View and manage your organization settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Organization Name</Label>
              <p className="text-sm text-muted-foreground mt-1">{currentOrg.name}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Members</Label>
              <p className="text-sm text-muted-foreground mt-1">{members.length} member{members.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Members List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Members</CardTitle>
              <CardDescription>Manage organization members and their roles</CardDescription>
            </div>
            <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Invite Member
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Invite Member</DialogTitle>
                  <DialogDescription>
                    Send an invitation to join your organization
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleInviteMember)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <Input placeholder="member@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setInviteDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={form.formState.isSubmitting}>
                        {form.formState.isSubmitting ? "Sending..." : "Send Invitation"}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    No members found
                  </TableCell>
                </TableRow>
              ) : (
                members.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium">{member.user?.name || "Unknown"}</TableCell>
                    <TableCell>{member.user?.email || "N/A"}</TableCell>
                    <TableCell>
                      <Badge variant={member.role === "owner" ? "default" : "secondary"}>
                        {member.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {member.role !== "owner" && isOwner && (
                        <Dialog open={removeMemberId === member.id} onOpenChange={(open) => setRemoveMemberId(open ? member.id : null)}>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <UserMinus className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Remove Member</DialogTitle>
                              <DialogDescription>
                                Are you sure you want to remove {member.user?.name || "this member"} from the organization?
                              </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setRemoveMemberId(null)}>
                                Cancel
                              </Button>
                              <Button variant="destructive" onClick={() => handleRemoveMember(member.user?.email || member.id)}>
                                Remove
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>Irreversible actions for this organization</CardDescription>
        </CardHeader>
        <CardContent>
          <Dialog open={leaveDialogOpen} onOpenChange={setLeaveDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <LogOut className="mr-2 h-4 w-4" />
                Leave Organization
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Leave Organization</DialogTitle>
                <DialogDescription>
                  Are you sure you want to leave {currentOrg.name}? You will need to be re-invited to rejoin.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setLeaveDialogOpen(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleLeaveOrganization}>
                  Leave Organization
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  )
}
