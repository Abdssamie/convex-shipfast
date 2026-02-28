"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { toast } from "sonner"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

const accountFormSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  currentPassword: z.string().optional(),
  newPassword: z.string().optional(),
  confirmPassword: z.string().optional(),
})

type AccountFormValues = z.infer<typeof accountFormSchema>

export default function AccountSettings() {
  const router = useRouter()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  
  const profile = useQuery(api.user.getCurrentProfile)
  const updateProfile = useMutation(api.user.updateProfile)
  const deleteAccount = useMutation(api.user.deleteAccount)
  
  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      username: "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  })

  // Load user data when profile is available
  useEffect(() => {
    if (profile) {
      const nameParts = profile.name?.split(" ") || ["", ""]
      form.reset({
        firstName: nameParts[0] || "",
        lastName: nameParts.slice(1).join(" ") || "",
        email: profile.email || "",
        username: profile.email?.split("@")[0] || "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
    }
  }, [profile, form])

  async function onSubmit(data: AccountFormValues) {
    try {
      // Sanitize input data
      const sanitizedData = {
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        email: data.email.trim(),
        username: data.username.trim(),
        currentPassword: data.currentPassword?.trim(),
        newPassword: data.newPassword?.trim(),
        confirmPassword: data.confirmPassword?.trim(),
      }

      // Validate password fields if any are filled
      if (sanitizedData.newPassword || sanitizedData.confirmPassword) {
        if (sanitizedData.newPassword !== sanitizedData.confirmPassword) {
          toast.error("New passwords do not match")
          return
        }
        if (!sanitizedData.currentPassword) {
          toast.error("Current password is required to change password")
          return
        }
        // Note: Password change would need a separate backend endpoint
        toast.error("Password change not yet implemented")
        return
      }

      const fullName = `${sanitizedData.firstName} ${sanitizedData.lastName}`.trim()
      
      await updateProfile({
        name: fullName,
      })
      
      toast.success("Account settings updated successfully")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update account settings")
    }
  }

  async function handleDeleteAccount() {
    setIsDeleting(true)
    try {
      await deleteAccount()
      toast.success("Account deleted successfully")
      router.push("/")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete account")
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  const isLoading = profile === undefined
  const isSaving = form.formState.isSubmitting

  if (isLoading) {
    return (
      <div className="space-y-6 px-4 lg:px-6 flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Loading account settings...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 px-4 lg:px-6">
        <div>
          <h1 className="text-3xl font-bold">Account Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences.
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  Update your personal information that will be displayed on your profile.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your first name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your last name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="Enter your email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your username" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>
                  Update your password to keep your account secure.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="currentPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Enter current password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Enter new password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm New Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Confirm new password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Danger Zone</CardTitle>
                <CardDescription>
                  Irreversible and destructive actions.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Separator />
                <div className="flex flex-wrap gap-2 items-center justify-between">
                  <div>
                    <h4 className="font-semibold">Delete Account</h4>
                    <p className="text-sm text-muted-foreground">
                      Permanently delete your account and all associated data.
                    </p>
                  </div>
                  <Button 
                    variant="destructive" 
                    type="button" 
                    onClick={() => setShowDeleteDialog(true)}
                    className="cursor-pointer"
                  >
                    Delete Account
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="flex space-x-2">
              <Button type="submit" disabled={isSaving} className="cursor-pointer">
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
              <Button variant="outline" type="reset" onClick={() => form.reset()} className="cursor-pointer">
                Cancel
              </Button>
            </div>
          </form>
        </Form>

        {/* Delete Confirmation Dialog */}
        {showDeleteDialog && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
            <div className="bg-background p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
              <h2 className="text-xl font-bold mb-2">Delete Account</h2>
              <p className="text-muted-foreground mb-6">
                Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently deleted.
              </p>
              <div className="flex justify-end gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setShowDeleteDialog(false)}
                  disabled={isDeleting}
                >
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleDeleteAccount}
                  disabled={isDeleting}
                >
                  {isDeleting ? "Deleting..." : "Delete Account"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
  )
}
