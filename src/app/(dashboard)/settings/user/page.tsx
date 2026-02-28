"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent,CardHeader, CardDescription, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Upload } from "lucide-react"
import { useRef, useState, useEffect } from "react"
import { Separator } from "@/components/ui/separator"
import { Logo } from "@/components/logo"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { toast } from "sonner"
import { Id } from "@/convex/_generated/dataModel"

const userFormSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  website: z.string().optional(),
  location: z.string().optional(),
  role: z.string().optional(),
  bio: z.string().optional(),
  company: z.string().optional(),
  timezone: z.string().optional(),
  language: z.string().optional(),
})

type UserFormValues = z.infer<typeof userFormSchema>

export default function UserSettingsPage() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [useDefaultIcon, setUseDefaultIcon] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  
  const profile = useQuery(api.user.getCurrentProfile)
  const updateProfile = useMutation(api.user.updateProfile)
  const generateUploadUrl = useMutation(api.user.generateUploadUrl)
  const updateAvatar = useMutation(api.user.updateAvatar)
  
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      website: "",
      location: "",
      role: "",
      bio: "",
      company: "",
      timezone: "",
      language: "",
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
        phone: "",
        website: "",
        location: "",
        role: "",
        bio: profile.bio || "",
        company: "",
        timezone: "",
        language: "",
      })
      
      if (profile.image) {
        setProfileImage(profile.image)
        setUseDefaultIcon(false)
      }
    }
  }, [profile, form])

  async function onSubmit(data: UserFormValues) {
    try {
      // Sanitize all input fields
      const sanitizedData = {
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        email: data.email.trim().toLowerCase(),
        phone: data.phone?.trim(),
        website: data.website?.trim(),
        location: data.location?.trim(),
        role: data.role?.trim(),
        bio: data.bio?.trim(),
        company: data.company?.trim(),
        timezone: data.timezone?.trim(),
        language: data.language?.trim(),
      }

      const fullName = `${sanitizedData.firstName} ${sanitizedData.lastName}`.trim()
      
      await updateProfile({
        name: fullName,
        bio: sanitizedData.bio,
      })
      
      toast.success("Profile updated successfully")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update profile")
    }
  }

  const handleFileUpload = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file size (800KB)
    if (file.size > 800 * 1024) {
      toast.error("File size must be less than 800KB")
      return
    }

    // Validate file type
    if (!["image/jpeg", "image/gif", "image/png"].includes(file.type)) {
      toast.error("Only JPG, GIF, and PNG files are allowed")
      return
    }

    setIsUploading(true)
    try {
      // Preview the image locally
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result
        if (typeof result === 'string') {
          setProfileImage(result)
          setUseDefaultIcon(false)
        }
      }
      reader.readAsDataURL(file)

      // Upload to Convex
      const uploadUrl = await generateUploadUrl()
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      })

      if (!result.ok) {
        throw new Error("Upload failed")
      }

      const { storageId } = await result.json()
      
      // Validate storageId before casting
      if (!storageId || typeof storageId !== 'string') {
        throw new Error("Invalid storage ID received")
      }
      
      await updateAvatar({ storageId: storageId as Id<"_storage"> })
      
      toast.success("Avatar updated successfully")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to upload avatar")
      setProfileImage(null)
      setUseDefaultIcon(true)
    } finally {
      setIsUploading(false)
    }
  }

  const handleReset = () => {
    setProfileImage(null)
    setUseDefaultIcon(true)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const isLoading = profile === undefined
  const isSaving = form.formState.isSubmitting

  if (isLoading) {
    return (
      <div className="px-4 lg:px-6 flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Loading profile...</p>
      </div>
    )
  }

  return (
    <div className="px-4 lg:px-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Card>
              <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
                <CardDescription>Update your personal information and preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
            {/* Profile Picture Section */}
            <div className="flex items-center gap-6 ">
              {useDefaultIcon ? (
                <div className="flex h-20 w-20 items-center justify-center rounded-lg">
                  < Logo size={56} />
                </div>
              ) : (
                <Avatar className="h-20 w-20 rounded-lg">
                  <AvatarImage src={profileImage || undefined} />
                  <AvatarFallback>SS</AvatarFallback>
                </Avatar>
              )}
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <Button 
                    type="button"
                    variant="default" 
                    size="sm"
                    onClick={handleFileUpload}
                    disabled={isUploading}
                    className="cursor-pointer"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {isUploading ? "Uploading..." : "Upload new photo"}
                  </Button>
                  <Button 
                    type="button"
                    variant="outline" 
                    size="sm"
                    onClick={handleReset}
                    disabled={isUploading}
                    className="cursor-pointer"
                  >
                    Reset
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Allowed JPG, GIF or PNG. Max size of 800K
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/gif,image/png"
                onChange={handleFileChange}
                className="hidden"
                disabled={isUploading}
              />
            </div>

            <Separator className="mb-10" />
            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* First Name */}
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

              {/* Last Name */}
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

              {/* Email */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mail</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="Enter your email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Company */}
              <FormField
                control={form.control}
                name="company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your company" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Phone Number */}
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="Enter your phone number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Location */}
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your location" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Website */}
              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website</FormLabel>
                    <FormControl>
                      <Input type="url" placeholder="Enter your website" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Language */}
              <FormField
                control={form.control}
                name="language"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Language</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select Language" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="english">English</SelectItem>
                        <SelectItem value="spanish">Spanish</SelectItem>
                        <SelectItem value="french">French</SelectItem>
                        <SelectItem value="german">German</SelectItem>
                        <SelectItem value="italian">Italian</SelectItem>
                        <SelectItem value="portuguese">Portuguese</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Role */}
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your role" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Timezone */}
              <FormField
                control={form.control}
                name="timezone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Timezone</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select Timezone" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pst">PST (Pacific Standard Time)</SelectItem>
                        <SelectItem value="est">EST (Eastern Standard Time)</SelectItem>
                        <SelectItem value="cst">CST (Central Standard Time)</SelectItem>
                        <SelectItem value="mst">MST (Mountain Standard Time)</SelectItem>
                        <SelectItem value="utc">UTC (Coordinated Universal Time)</SelectItem>
                        <SelectItem value="cet">CET (Central European Time)</SelectItem>
                        <SelectItem value="jst">JST (Japan Standard Time)</SelectItem>
                        <SelectItem value="aest">AEST (Australian Eastern Standard Time)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Bio - Full Width */}
            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bio</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Tell us a little about yourself..." 
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Action Buttons */}
            <div className="flex justify-start gap-3">
              <Button type="submit" disabled={isSaving} className="cursor-pointer">
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
              <Button variant="outline" type="button" onClick={() => form.reset()} className="cursor-pointer">
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
          </form>
        </Form>
      </div>
  )
}
